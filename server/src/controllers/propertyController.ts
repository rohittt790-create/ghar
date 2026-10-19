import { Response } from 'express';
import { Property } from '../models/Property.js';
import { Task } from '../models/Task.js';
import { Owner } from '../models/Owner.js';
import { Reminder } from '../models/Reminder.js';
import { processUploadedFile } from '../middleware/upload.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Helper to recalculate a property's progress percentage and actual expenses
 * based on all associated tasks.
 */
export const recalculatePropertyProgress = async (propertyId: string): Promise<number> => {
  const tasks = await Task.find({ property: propertyId });
  if (tasks.length === 0) {
    await Property.findByIdAndUpdate(propertyId, { progressPercentage: 0, actualExpenses: 0 });
    return 0;
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  // Weight in-progress as 0.4 completion
  const weightedProgress = Math.min(
    100,
    Math.round(((completedCount + inProgressCount * 0.4) / tasks.length) * 100)
  );

  const totalActualExpenses = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);

  // If 100% completed, set status to completed
  let newStatus: 'planning' | 'in_progress' | 'completed' | 'on_hold' | undefined;
  if (weightedProgress === 100) {
    newStatus = 'completed';
  }

  await Property.findByIdAndUpdate(propertyId, {
    progressPercentage: weightedProgress,
    actualExpenses: totalActualExpenses,
    ...(newStatus ? { status: newStatus } : {}),
  });

  return weightedProgress;
};

export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { search, owner, status, propertyType, sort = '-createdAt' } = req.query;

    let filter: any = { createdBy: userId };

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter = {
        createdBy: userId,
        $or: [
          { name: searchRegex },
          { propertyId: searchRegex },
          { address: searchRegex },
          { city: searchRegex },
        ],
      };
    }

    if (owner) {
      filter.owner = owner;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType;
    }

    const properties = await Property.find(filter)
      .populate('owner', 'name phone email address profilePicture')
      .sort(String(sort));

    // For each property, fetch live task summary counts
    const enrichedProperties = await Promise.all(
      properties.map(async (prop) => {
        const tasks = await Task.find({ property: prop._id, createdBy: userId });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const overdueTasks = tasks.filter((t) => {
          return t.status !== 'completed' && new Date(t.dueDate) < new Date();
        }).length;

        return {
          ...prop.toObject(),
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedProperties.length,
      properties: enrichedProperties,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching properties' });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const property = await Property.findOne({ _id: req.params.id, createdBy: userId }).populate(
      'owner',
      'name phone email address profilePicture city state zipCode emergencyContact notes'
    );

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const tasks = await Task.find({ property: property._id, createdBy: userId }).sort({ dueDate: 1 });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const notStartedTasks = tasks.filter((t) => t.status === 'not_started').length;
    const onHoldTasks = tasks.filter((t) => t.status === 'on_hold').length;
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    // Aggregate category progress
    const categoriesMap: { [cat: string]: { total: number; completed: number; estimatedCost: number; actualCost: number } } = {};
    tasks.forEach((t) => {
      if (!categoriesMap[t.category]) {
        categoriesMap[t.category] = { total: 0, completed: 0, estimatedCost: 0, actualCost: 0 };
      }
      categoriesMap[t.category].total += 1;
      if (t.status === 'completed') categoriesMap[t.category].completed += 1;
      categoriesMap[t.category].estimatedCost += t.estimatedCost || 0;
      categoriesMap[t.category].actualCost += t.actualCost || 0;
    });

    const categoryBreakdown = Object.entries(categoriesMap).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      progress: Math.round((stats.completed / stats.total) * 100),
      estimatedCost: stats.estimatedCost,
      actualCost: stats.actualCost,
    }));

    res.status(200).json({
      success: true,
      property: {
        ...property.toObject(),
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          notStartedTasks,
          onHoldTasks,
          overdueTasks,
          categoryBreakdown,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching property' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const {
      propertyId,
      name,
      address,
      city,
      state,
      zipCode,
      owner,
      startDate,
      expectedCompletionDate,
      status,
      estimatedBudget,
      squareFeet,
      propertyType,
      notes,
    } = req.body;

    if (!propertyId || !name || !address || !city || !owner || !startDate || !expectedCompletionDate) {
      res.status(400).json({
        success: false,
        message: 'Please provide Property ID, Name, Address, City, Owner, Start Date, and Expected Completion Date.',
      });
      return;
    }

    // Verify owner exists and belongs to this user
    const ownerExists = await Owner.findOne({ _id: owner, createdBy: userId });
    if (!ownerExists) {
      res.status(400).json({ success: false, message: 'Invalid owner selected. Owner does not exist.' });
      return;
    }

    // Check unique propertyId for this user
    const existing = await Property.findOne({ propertyId: propertyId.trim().toUpperCase(), createdBy: userId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Property ID "${propertyId}" already exists. Please choose a unique ID.`,
      });
      return;
    }

    let coverPhoto = '';
    const uploadedPhotos: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const fileUrl = await processUploadedFile(req.files[i]);
        uploadedPhotos.push(fileUrl);
        if (i === 0) coverPhoto = fileUrl;
      }
    } else if (req.body.coverPhoto) {
      coverPhoto = req.body.coverPhoto;
    }

    if (req.body.propertyPhotos) {
      const photos = Array.isArray(req.body.propertyPhotos)
        ? req.body.propertyPhotos
        : [req.body.propertyPhotos];
      photos.forEach((p: string) => {
        if (!uploadedPhotos.includes(p)) uploadedPhotos.push(p);
      });
    }

    const property = await Property.create({
      propertyId: propertyId.trim().toUpperCase(),
      name,
      address,
      city,
      state: state || '',
      zipCode: zipCode || '',
      owner,
      startDate: new Date(startDate),
      expectedCompletionDate: new Date(expectedCompletionDate),
      status: status || 'in_progress',
      coverPhoto: coverPhoto || (uploadedPhotos[0] || ''),
      propertyPhotos: uploadedPhotos,
      estimatedBudget: Number(estimatedBudget) || 0,
      actualExpenses: 0,
      squareFeet: Number(squareFeet) || 0,
      propertyType: propertyType || 'residential',
      notes: notes || '',
      progressPercentage: 0,
      createdBy: userId,
    });

    const populatedProperty = await Property.findById(property._id).populate('owner');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: populatedProperty,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const property = await Property.findOne({ _id: req.params.id, createdBy: userId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const {
      propertyId,
      name,
      address,
      city,
      state,
      zipCode,
      owner,
      startDate,
      expectedCompletionDate,
      actualCompletionDate,
      status,
      estimatedBudget,
      squareFeet,
      propertyType,
      notes,
      coverPhoto,
    } = req.body;

    if (propertyId && propertyId.toUpperCase() !== property.propertyId) {
      const existing = await Property.findOne({
        propertyId: propertyId.toUpperCase(),
        createdBy: userId,
        _id: { $ne: property._id },
      });
      if (existing) {
        res.status(400).json({ success: false, message: `Property ID "${propertyId}" is already in use.` });
        return;
      }
      property.propertyId = propertyId.toUpperCase();
    }

    if (name) property.name = name;
    if (address) property.address = address;
    if (city) property.city = city;
    if (state !== undefined) property.state = state;
    if (zipCode !== undefined) property.zipCode = zipCode;
    if (owner) {
      const ownerExists = await Owner.findOne({ _id: owner, createdBy: userId });
      if (!ownerExists) {
        res.status(400).json({ success: false, message: 'Selected owner not found.' });
        return;
      }
      property.owner = owner;
    }
    if (startDate) property.startDate = new Date(startDate);
    if (expectedCompletionDate) property.expectedCompletionDate = new Date(expectedCompletionDate);
    if (actualCompletionDate) property.actualCompletionDate = new Date(actualCompletionDate);
    if (status) property.status = status;
    if (estimatedBudget !== undefined) property.estimatedBudget = Number(estimatedBudget);
    if (squareFeet !== undefined) property.squareFeet = Number(squareFeet);
    if (propertyType) property.propertyType = propertyType;
    if (notes !== undefined) property.notes = notes;
    if (coverPhoto) property.coverPhoto = coverPhoto;

    // Handle new uploaded photos
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = await processUploadedFile(file);
        property.propertyPhotos.push(fileUrl);
        if (!property.coverPhoto) property.coverPhoto = fileUrl;
      }
    }

    await property.save();
    await recalculatePropertyProgress(property._id.toString());

    const updated = await Property.findById(property._id).populate('owner');

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const property = await Property.findOne({ _id: req.params.id, createdBy: userId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Delete associated tasks and reminders
    await Task.deleteMany({ property: property._id, createdBy: userId });
    await Reminder.deleteMany({ property: property._id, createdBy: userId });
    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property and its associated tasks were deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting property' });
  }
};
