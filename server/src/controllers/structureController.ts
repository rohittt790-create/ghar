import { Response } from 'express';
import { Types } from 'mongoose';
import { Floor } from '../models/Floor.js';
import { Room, IRoom } from '../models/Room.js';
import { Resident } from '../models/Resident.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';
import { processUploadedFile } from '../middleware/upload.js';

// =========================================================================
// FLOORS CONTROLLER
// =========================================================================

export const getFloorsByProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;

    const property = await Property.findOne({ _id: propertyId, createdBy: userId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    const floors = await Floor.find({ property: propertyId, createdBy: userId }).sort({ floorNumber: 1 });

    // Compute room metrics per floor
    const floorsWithStats = await Promise.all(
      floors.map(async (floor) => {
        const rooms = await Room.find({ floor: floor._id, property: propertyId });
        const roomsCount = rooms.length;
        const bathroomsCount = rooms.filter((r) => r.roomType === 'bathroom').length;
        const bedroomsCount = rooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom').length;
        const balconiesCount = rooms.filter((r) => r.roomType === 'balcony').length;
        const kitchensCount = rooms.filter((r) => r.roomType === 'kitchen').length;
        const livingHallsCount = rooms.filter((r) => r.roomType === 'living_room' || r.roomType === 'hall').length;
        const otherSpacesCount = roomsCount - (bathroomsCount + bedroomsCount + balconiesCount + kitchensCount + livingHallsCount);
        const totalAreaSqFt = rooms.reduce((acc, r) => acc + (r.areaSqFt || 0), 0);

        return {
          ...floor.toObject(),
          stats: {
            roomsCount,
            bathroomsCount,
            bedroomsCount,
            balconiesCount,
            kitchensCount,
            livingHallsCount,
            otherSpacesCount,
            totalAreaSqFt,
          },
        };
      })
    );

    res.status(200).json({ success: true, count: floorsWithStats.length, floors: floorsWithStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching floors' });
  }
};

export const createFloor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;
    const { name, floorNumber, status, progressPercentage, notes } = req.body;

    const property = await Property.findOne({ _id: propertyId, createdBy: userId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    if (!name || floorNumber === undefined) {
      res.status(400).json({ success: false, message: 'Floor name and floor number are required.' });
      return;
    }

    // Check if floor number already exists for this property
    const existing = await Floor.findOne({ property: propertyId, floorNumber: Number(floorNumber) });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Floor with number ${floorNumber} already exists (${existing.name}).`,
      });
      return;
    }

    let floorPlanImage = '';
    if (req.file) {
      floorPlanImage = await processUploadedFile(req.file);
    } else if (req.body.floorPlanImage) {
      floorPlanImage = req.body.floorPlanImage;
    }

    const floor = await Floor.create({
      property: propertyId,
      floorNumber: Number(floorNumber),
      name: name.trim(),
      floorPlanImage,
      floorPhotos: [],
      status: status || 'in_progress',
      progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : 0,
      notes: notes || '',
      createdBy: userId,
    });

    res.status(201).json({ success: true, message: 'Floor created successfully', floor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating floor' });
  }
};

export const updateFloor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const floor = await Floor.findOne({ _id: id, createdBy: userId });
    if (!floor) {
      res.status(404).json({ success: false, message: 'Floor not found.' });
      return;
    }

    const { name, floorNumber, status, progressPercentage, notes } = req.body;

    if (floorNumber !== undefined && Number(floorNumber) !== floor.floorNumber) {
      const duplicate = await Floor.findOne({
        property: floor.property,
        floorNumber: Number(floorNumber),
        _id: { $ne: id },
      });
      if (duplicate) {
        res.status(400).json({
          success: false,
          message: `Floor number ${floorNumber} is already used by ${duplicate.name}.`,
        });
        return;
      }
      floor.floorNumber = Number(floorNumber);
    }

    if (name) floor.name = name.trim();
    if (status) floor.status = status;
    if (progressPercentage !== undefined) floor.progressPercentage = Number(progressPercentage);
    if (notes !== undefined) floor.notes = notes;

    if (req.file) {
      floor.floorPlanImage = await processUploadedFile(req.file);
    } else if (req.body.floorPlanImage !== undefined) {
      floor.floorPlanImage = req.body.floorPlanImage;
    }

    await floor.save();
    res.status(200).json({ success: true, message: 'Floor updated successfully', floor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating floor' });
  }
};

export const deleteFloor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const floor = await Floor.findOne({ _id: id, createdBy: userId });
    if (!floor) {
      res.status(404).json({ success: false, message: 'Floor not found.' });
      return;
    }

    // Delete all rooms on this floor
    await Room.deleteMany({ floor: id });

    // Unassign residents currently on this floor
    await Resident.updateMany(
      { currentFloor: id },
      { $unset: { currentFloor: 1, currentRoom: 1 } }
    );

    await floor.deleteOne();
    res.status(200).json({ success: true, message: 'Floor and its rooms removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting floor' });
  }
};

// =========================================================================
// ROOMS CONTROLLER
// =========================================================================

export const getRoomsByProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;
    const { floorId, roomType, constructionStatus, occupancyStatus, search } = req.query;

    const filter: any = { property: propertyId, createdBy: userId };

    if (floorId && floorId !== 'all') {
      filter.floor = floorId;
    }
    if (roomType && roomType !== 'all') {
      filter.roomType = roomType;
    }
    if (constructionStatus && constructionStatus !== 'all') {
      filter.constructionStatus = constructionStatus;
    }
    if (occupancyStatus && occupancyStatus !== 'all') {
      filter.occupancyStatus = occupancyStatus;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [{ name: searchRegex }, { roomId: searchRegex }, { notes: searchRegex }];
    }

    const rooms = await Room.find(filter).populate('floor', 'name floorNumber').sort({ roomId: 1 });

    // Attach active occupants to each room
    const roomsWithOccupants = await Promise.all(
      rooms.map(async (room) => {
        const occupants = await Resident.find({
          property: propertyId,
          currentRoom: room._id,
          status: 'currently_living',
        }).select('_id name relationship phone profilePhoto moveInDate');

        // Dynamic occupancy status calculation
        let dynamicOccupancy: 'occupied' | 'vacant' | 'under_maintenance' = room.occupancyStatus;
        if (room.occupancyStatus !== 'under_maintenance') {
          dynamicOccupancy = occupants.length > 0 ? 'occupied' : 'vacant';
        }

        return {
          ...room.toObject(),
          occupancyStatus: dynamicOccupancy,
          occupantsCount: occupants.length,
          occupants,
        };
      })
    );

    res.status(200).json({ success: true, count: roomsWithOccupants.length, rooms: roomsWithOccupants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching rooms' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;
    const {
      floorId,
      name,
      roomId,
      roomType,
      dimensions,
      constructionStatus,
      interiorStatus,
      checklist,
      occupancyStatus,
      notes,
    } = req.body;

    if (!name || !floorId || !roomType) {
      res.status(400).json({ success: false, message: 'Room name, floor, and room type are required.' });
      return;
    }

    const floor = await Floor.findOne({ _id: floorId, property: propertyId, createdBy: userId });
    if (!floor) {
      res.status(404).json({ success: false, message: 'Assigned floor not found on this property.' });
      return;
    }

    // Auto-generate or format Room ID
    let finalRoomId = roomId ? roomId.trim().toUpperCase() : '';
    if (!finalRoomId) {
      const count = await Room.countDocuments({ property: propertyId });
      const floorPrefix = floor.floorNumber >= 0 ? `F${floor.floorNumber}` : `B${Math.abs(floor.floorNumber)}`;
      finalRoomId = `RM-${floorPrefix}-${String(count + 1).padStart(2, '0')}`;
    }

    const existingRoom = await Room.findOne({ property: propertyId, roomId: finalRoomId });
    if (existingRoom) {
      res.status(400).json({ success: false, message: `Room ID '${finalRoomId}' already exists in this property.` });
      return;
    }

    let parsedDimensions = { length: 0, width: 0, height: 10 };
    if (dimensions) {
      if (typeof dimensions === 'string') {
        try {
          parsedDimensions = JSON.parse(dimensions);
        } catch (e) {}
      } else {
        parsedDimensions = dimensions;
      }
    }
    const areaSqFt = Math.round((parsedDimensions.length || 0) * (parsedDimensions.width || 0) * 100) / 100;

    let parsedChecklist: any = undefined;
    if (checklist) {
      if (typeof checklist === 'string') {
        try {
          parsedChecklist = JSON.parse(checklist);
        } catch (e) {}
      } else {
        parsedChecklist = checklist;
      }
    }

    // Handle photos if uploaded
    const photos: string[] = [];
    if (req.file) {
      const url = await processUploadedFile(req.file);
      photos.push(url);
    }

    const room = await Room.create({
      property: propertyId,
      floor: floorId,
      roomId: finalRoomId,
      name: name.trim(),
      roomType,
      dimensions: parsedDimensions,
      areaSqFt,
      photos,
      constructionStatus: constructionStatus || 'in_progress',
      interiorStatus: interiorStatus || 'not_started',
      checklist: parsedChecklist,
      occupancyStatus: occupancyStatus || 'vacant',
      notes: notes || '',
      createdBy: userId,
    });

    res.status(201).json({ success: true, message: 'Room created successfully', room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const room = await Room.findOne({ _id: id, createdBy: userId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    const {
      name,
      roomId,
      floorId,
      roomType,
      dimensions,
      constructionStatus,
      interiorStatus,
      checklist,
      occupancyStatus,
      notes,
    } = req.body;

    if (roomId && roomId.trim().toUpperCase() !== room.roomId) {
      const duplicate = await Room.findOne({
        property: room.property,
        roomId: roomId.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        res.status(400).json({ success: false, message: `Room ID '${roomId}' is already in use.` });
        return;
      }
      room.roomId = roomId.trim().toUpperCase();
    }

    if (name) room.name = name.trim();
    if (floorId) room.floor = floorId;
    if (roomType) room.roomType = roomType;
    if (constructionStatus) room.constructionStatus = constructionStatus;
    if (interiorStatus) room.interiorStatus = interiorStatus;
    if (occupancyStatus) room.occupancyStatus = occupancyStatus;
    if (notes !== undefined) room.notes = notes;

    if (dimensions) {
      let parsed = dimensions;
      if (typeof dimensions === 'string') {
        try {
          parsed = JSON.parse(dimensions);
        } catch (e) {}
      }
      room.dimensions = parsed;
      room.areaSqFt = Math.round((parsed.length || 0) * (parsed.width || 0) * 100) / 100;
    }

    if (checklist) {
      let parsed = checklist;
      if (typeof checklist === 'string') {
        try {
          parsed = JSON.parse(checklist);
        } catch (e) {}
      }
      room.checklist = { ...room.checklist, ...parsed };
    }

    if (req.file) {
      const newPhoto = await processUploadedFile(req.file);
      room.photos.push(newPhoto);
    }

    await room.save();
    res.status(200).json({ success: true, message: 'Room updated successfully', room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const room = await Room.findOne({ _id: id, createdBy: userId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    // Unassign residents assigned to this room
    await Resident.updateMany({ currentRoom: id }, { $unset: { currentRoom: 1 } });

    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting room' });
  }
};

export const addRoomDefect = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { description, severity, notes } = req.body;

    if (!description) {
      res.status(400).json({ success: false, message: 'Defect description is required.' });
      return;
    }

    const room = await Room.findOne({ _id: id, createdBy: userId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    room.defects.push({
      description,
      severity: severity || 'medium',
      reportedDate: new Date(),
      resolved: false,
      notes: notes || '',
    });

    if (room.constructionStatus === 'completed') {
      room.constructionStatus = 'needs_repair';
    }

    await room.save();
    res.status(201).json({ success: true, message: 'Defect logged successfully', room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error logging defect' });
  }
};

export const resolveRoomDefect = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id, defectId } = req.params;

    const room = await Room.findOne({ _id: id, createdBy: userId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    const defect = (room.defects as any).id(defectId);
    if (!defect) {
      res.status(404).json({ success: false, message: 'Defect record not found.' });
      return;
    }

    defect.resolved = true;
    defect.resolvedDate = new Date();

    // If all defects are resolved, switch construction status back to completed if appropriate
    const allResolved = room.defects.every((d) => d.resolved);
    if (allResolved && room.constructionStatus === 'needs_repair') {
      room.constructionStatus = 'completed';
    }

    await room.save();
    res.status(200).json({ success: true, message: 'Defect marked resolved', room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error resolving defect' });
  }
};

// =========================================================================
// RESIDENTS CONTROLLER
// =========================================================================

export const getResidentsByProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;
    const { status, search } = req.query;

    const filter: any = { property: propertyId, createdBy: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }, { notes: searchRegex }];
    }

    const residents = await Resident.find(filter)
      .populate('currentFloor', 'name floorNumber')
      .populate('currentRoom', 'name roomId roomType areaSqFt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: residents.length, residents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching residents' });
  }
};

export const createResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;
    const {
      name,
      relationship,
      dob,
      age,
      phone,
      email,
      currentFloorId,
      currentRoomId,
      moveInDate,
      status,
      notes,
    } = req.body;

    if (!name || !relationship) {
      res.status(400).json({ success: false, message: 'Resident full name and relationship are required.' });
      return;
    }

    const property = await Property.findOne({ _id: propertyId, createdBy: userId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    let profilePhoto = '';
    if (req.file) {
      profilePhoto = await processUploadedFile(req.file);
    } else if (req.body.profilePhoto) {
      profilePhoto = req.body.profilePhoto;
    }

    let floorDoc: any = null;
    let roomDoc: any = null;

    if (currentRoomId) {
      roomDoc = await Room.findOne({ _id: currentRoomId, property: propertyId });
      if (roomDoc) {
        floorDoc = await Floor.findById(roomDoc.floor);
      }
    } else if (currentFloorId) {
      floorDoc = await Floor.findOne({ _id: currentFloorId, property: propertyId });
    }

    const initialAssignment = [];
    if (roomDoc && floorDoc) {
      initialAssignment.push({
        room: roomDoc._id,
        floor: floorDoc._id,
        roomName: `${roomDoc.roomId} - ${roomDoc.name}`,
        floorName: floorDoc.name,
        assignedDate: moveInDate ? new Date(moveInDate) : new Date(),
        notes: 'Initial room assignment upon registration.',
      });
    }

    const resident = await Resident.create({
      property: propertyId,
      name: name.trim(),
      profilePhoto,
      relationship,
      dob: dob ? new Date(dob) : undefined,
      age: age ? Number(age) : undefined,
      phone: phone || '',
      email: email || '',
      currentFloor: floorDoc?._id || undefined,
      currentRoom: roomDoc?._id || undefined,
      moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
      status: status || 'currently_living',
      notes: notes || '',
      assignmentHistory: initialAssignment,
      createdBy: userId,
    });

    // Update room occupancy status if assigned
    if (roomDoc && roomDoc.occupancyStatus === 'vacant') {
      roomDoc.occupancyStatus = 'occupied';
      await roomDoc.save();
    }

    res.status(201).json({ success: true, message: 'Resident registered successfully', resident });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating resident' });
  }
};

export const updateResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const resident = await Resident.findOne({ _id: id, createdBy: userId });
    if (!resident) {
      res.status(404).json({ success: false, message: 'Resident record not found.' });
      return;
    }

    const { name, relationship, dob, age, phone, email, moveInDate, notes } = req.body;

    if (name) resident.name = name.trim();
    if (relationship) resident.relationship = relationship;
    if (dob) resident.dob = new Date(dob);
    if (age !== undefined) resident.age = Number(age);
    if (phone !== undefined) resident.phone = phone;
    if (email !== undefined) resident.email = email;
    if (moveInDate) resident.moveInDate = new Date(moveInDate);
    if (notes !== undefined) resident.notes = notes;

    if (req.file) {
      resident.profilePhoto = await processUploadedFile(req.file);
    } else if (req.body.profilePhoto !== undefined) {
      resident.profilePhoto = req.body.profilePhoto;
    }

    await resident.save();
    res.status(200).json({ success: true, message: 'Resident updated successfully', resident });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating resident' });
  }
};

export const reassignResidentRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { newRoomId, notes } = req.body;

    const resident = await Resident.findOne({ _id: id, createdBy: userId });
    if (!resident) {
      res.status(404).json({ success: false, message: 'Resident not found.' });
      return;
    }

    if (!newRoomId) {
      res.status(400).json({ success: false, message: 'New room ID is required.' });
      return;
    }

    const newRoom = await Room.findOne({ _id: newRoomId, property: resident.property });
    if (!newRoom) {
      res.status(404).json({ success: false, message: 'Selected room not found.' });
      return;
    }

    const newFloor = await Floor.findById(newRoom.floor);
    const oldRoomId = resident.currentRoom;

    // Mark previous assignment vacatedDate
    if (resident.assignmentHistory && resident.assignmentHistory.length > 0) {
      const activeEntry = resident.assignmentHistory[resident.assignmentHistory.length - 1];
      if (!activeEntry.vacatedDate) {
        activeEntry.vacatedDate = new Date();
      }
    }

    // Add new assignment to history
    resident.assignmentHistory.push({
      room: newRoom._id as Types.ObjectId,
      floor: newFloor?._id as Types.ObjectId,
      roomName: `${newRoom.roomId} - ${newRoom.name}`,
      floorName: newFloor?.name || '',
      assignedDate: new Date(),
      notes: notes || 'Reassigned to new room.',
    });

    resident.currentRoom = newRoom._id as Types.ObjectId;
    resident.currentFloor = newFloor?._id as Types.ObjectId;
    await resident.save();

    // Mark new room as occupied
    if (newRoom.occupancyStatus === 'vacant') {
      newRoom.occupancyStatus = 'occupied';
      await newRoom.save();
    }

    // Recheck old room occupancy
    if (oldRoomId) {
      const remainingOccupants = await Resident.countDocuments({
        currentRoom: oldRoomId,
        status: 'currently_living',
      });
      if (remainingOccupants === 0) {
        await Room.findByIdAndUpdate(oldRoomId, { occupancyStatus: 'vacant' });
      }
    }

    res.status(200).json({ success: true, message: 'Resident reassigned to new room successfully', resident });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error reassigning room' });
  }
};

export const markResidentMoveOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { moveOutDate, notes } = req.body;

    const resident = await Resident.findOne({ _id: id, createdBy: userId });
    if (!resident) {
      res.status(404).json({ success: false, message: 'Resident not found.' });
      return;
    }

    const previousRoomId = resident.currentRoom;

    // Close assignment history
    if (resident.assignmentHistory && resident.assignmentHistory.length > 0) {
      const activeEntry = resident.assignmentHistory[resident.assignmentHistory.length - 1];
      if (!activeEntry.vacatedDate) {
        activeEntry.vacatedDate = moveOutDate ? new Date(moveOutDate) : new Date();
      }
    }

    resident.status = 'moved_out';
    resident.moveOutDate = moveOutDate ? new Date(moveOutDate) : new Date();
    if (notes) {
      resident.notes = resident.notes ? `${resident.notes}\n[Move-out note]: ${notes}` : `[Move-out note]: ${notes}`;
    }
    resident.currentRoom = undefined;
    resident.currentFloor = undefined;
    await resident.save();

    // If previous room has no other living occupants, mark vacant
    if (previousRoomId) {
      const remainingOccupants = await Resident.countDocuments({
        currentRoom: previousRoomId,
        status: 'currently_living',
      });
      if (remainingOccupants === 0) {
        await Room.findByIdAndUpdate(previousRoomId, { occupancyStatus: 'vacant' });
      }
    }

    res.status(200).json({ success: true, message: 'Resident marked as moved out. History preserved.', resident });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error marking move out' });
  }
};

export const deleteResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const resident = await Resident.findOne({ _id: id, createdBy: userId });
    if (!resident) {
      res.status(404).json({ success: false, message: 'Resident not found.' });
      return;
    }

    const oldRoomId = resident.currentRoom;
    await resident.deleteOne();

    if (oldRoomId) {
      const remainingOccupants = await Resident.countDocuments({
        currentRoom: oldRoomId,
        status: 'currently_living',
      });
      if (remainingOccupants === 0) {
        await Room.findByIdAndUpdate(oldRoomId, { occupancyStatus: 'vacant' });
      }
    }

    res.status(200).json({ success: true, message: 'Resident record deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting resident' });
  }
};

// =========================================================================
// HOUSE OVERVIEW & AGGREGATE STRUCTURE ANALYTICS
// =========================================================================

export const getStructureOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { propertyId } = req.params;

    const property = await Property.findOne({ _id: propertyId, createdBy: userId })
      .populate('owner', 'name phone email address city profilePicture');
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    const floors = await Floor.find({ property: propertyId, createdBy: userId }).sort({ floorNumber: 1 });
    const rooms = await Room.find({ property: propertyId, createdBy: userId }).populate('floor', 'name floorNumber');
    const activeResidents = await Resident.find({
      property: propertyId,
      createdBy: userId,
      status: 'currently_living',
    }).populate('currentFloor', 'name floorNumber').populate('currentRoom', 'name roomId roomType');

    // Categorization counts
    const totalFloors = floors.length;
    const totalRooms = rooms.length;
    const bedrooms = rooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom');
    const totalBedrooms = bedrooms.length;
    const totalBathrooms = rooms.filter((r) => r.roomType === 'bathroom').length;
    const totalBalconies = rooms.filter((r) => r.roomType === 'balcony').length;
    const totalKitchens = rooms.filter((r) => r.roomType === 'kitchen').length;
    const totalHallsLiving = rooms.filter((r) => r.roomType === 'living_room' || r.roomType === 'hall').length;
    const totalDining = rooms.filter((r) => r.roomType === 'dining_room').length;
    const totalPooja = rooms.filter((r) => r.roomType === 'pooja_room').length;
    const totalOtherSpaces = rooms.filter((r) =>
      ['study_room', 'store_room', 'utility_room', 'other'].includes(r.roomType)
    ).length;

    const totalCalculatedArea = rooms.reduce((acc, r) => acc + (r.areaSqFt || 0), 0);

    // Active occupancy on bedrooms
    const occupiedBedroomIds = new Set(
      activeResidents.map((res) => res.currentRoom?._id?.toString()).filter(Boolean)
    );
    const occupiedBedrooms = bedrooms.filter((b) => occupiedBedroomIds.has((b._id as any).toString())).length;
    const vacantBedrooms = Math.max(0, totalBedrooms - occupiedBedrooms);

    const roomsUnderMaintenance = rooms.filter(
      (r) => r.occupancyStatus === 'under_maintenance' || r.constructionStatus === 'needs_repair'
    ).length;

    const roomsUnderConstruction = rooms.filter(
      (r) => r.constructionStatus === 'not_started' || r.constructionStatus === 'in_progress'
    ).length;

    const roomsCompleted = rooms.filter((r) => r.constructionStatus === 'completed').length;

    // Floor-wise nested breakdown
    const floorsOverview = floors.map((fl) => {
      const floorRooms = rooms.filter((r) => r.floor?._id?.toString() === (fl._id as any).toString());
      return {
        ...fl.toObject(),
        roomsCount: floorRooms.length,
        areaSqFt: floorRooms.reduce((acc, r) => acc + (r.areaSqFt || 0), 0),
        bedroomsCount: floorRooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom').length,
        bathroomsCount: floorRooms.filter((r) => r.roomType === 'bathroom').length,
        rooms: floorRooms.map((fr) => {
          const roomResidents = activeResidents.filter(
            (ar) => ar.currentRoom?._id?.toString() === (fr._id as any).toString()
          );
          return {
            ...fr.toObject(),
            occupants: roomResidents,
            occupantsCount: roomResidents.length,
            isOccupied: roomResidents.length > 0,
          };
        }),
      };
    });

    res.status(200).json({
      success: true,
      property: {
        _id: property._id,
        propertyId: property.propertyId,
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        owner: property.owner,
        coverPhoto: property.coverPhoto || property.propertyPhotos[0] || '',
        propertyPhotos: property.propertyPhotos,
        squareFeet: property.squareFeet,
        estimatedBudget: property.estimatedBudget,
        actualExpenses: property.actualExpenses,
        progressPercentage: property.progressPercentage,
        status: property.status,
      },
      stats: {
        totalFloors,
        totalRooms,
        totalBedrooms,
        totalBathrooms,
        totalBalconies,
        totalKitchens,
        totalHallsLiving,
        totalDining,
        totalPooja,
        totalOtherSpaces,
        totalCalculatedArea,
        totalActiveResidents: activeResidents.length,
        occupiedBedrooms,
        vacantBedrooms,
        roomsUnderMaintenance,
        roomsUnderConstruction,
        roomsCompleted,
      },
      floors: floorsOverview,
      activeResidents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching house structure overview' });
  }
};
