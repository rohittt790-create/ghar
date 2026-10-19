"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.uploadTaskPhotos = exports.updateTaskStatus = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const Task_js_1 = require("../models/Task.js");
const Property_js_1 = require("../models/Property.js");
const propertyController_js_1 = require("./propertyController.js");
const upload_js_1 = require("../middleware/upload.js");
const getTasks = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { property, category, status, priority, worker, search, overdueOnly, startDate, endDate, sort = 'dueDate', } = req.query;
        let filter = { createdBy: userId };
        if (property && property !== 'all') {
            filter.property = property;
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (priority && priority !== 'all') {
            filter.priority = priority;
        }
        if (worker && worker !== 'all') {
            filter.assignedWorker = new RegExp(String(worker), 'i');
        }
        if (search) {
            const searchRegex = new RegExp(String(search), 'i');
            filter = {
                createdBy: userId,
                ...(filter.property ? { property: filter.property } : {}),
                ...(filter.category ? { category: filter.category } : {}),
                ...(filter.status ? { status: filter.status } : {}),
                ...(filter.priority ? { priority: filter.priority } : {}),
                $or: [
                    { taskName: searchRegex },
                    { description: searchRegex },
                    { assignedWorker: searchRegex },
                    { notes: searchRegex },
                ],
            };
        }
        // Overdue filter
        if (overdueOnly === 'true') {
            filter.status = { $ne: 'completed' };
            filter.dueDate = { $lt: new Date() };
        }
        // Date range filter (for calendar views or reports)
        if (startDate && endDate) {
            filter.$or = [
                {
                    startDate: {
                        $gte: new Date(String(startDate)),
                        $lte: new Date(String(endDate)),
                    },
                },
                {
                    dueDate: {
                        $gte: new Date(String(startDate)),
                        $lte: new Date(String(endDate)),
                    },
                },
            ];
        }
        const tasks = await Task_js_1.Task.find(filter)
            .populate({
            path: 'property',
            select: 'propertyId name address coverPhoto owner',
            populate: { path: 'owner', select: 'name phone email profilePicture' },
        })
            .sort(String(sort));
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching tasks' });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const task = await Task_js_1.Task.findOne({ _id: req.params.id, createdBy: userId }).populate({
            path: 'property',
            populate: { path: 'owner' },
        });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        res.status(200).json({
            success: true,
            task,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching task' });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { property, taskName, description, category, assignedWorker, workerPhone, startDate, dueDate, priority, estimatedCost, actualCost, notes, status, } = req.body;
        if (!property || !taskName || !category || !assignedWorker || !startDate || !dueDate) {
            res.status(400).json({
                success: false,
                message: 'Please provide Property, Task Name, Category, Assigned Worker, Start Date, and Due Date.',
            });
            return;
        }
        const propertyDoc = await Property_js_1.Property.findOne({ _id: property, createdBy: userId });
        if (!propertyDoc) {
            res.status(400).json({ success: false, message: 'Invalid property specified.' });
            return;
        }
        const userName = req.user ? req.user.name : 'System Admin';
        // Handle any photos uploaded during creation
        const progressPhotos = [];
        if (req.files && Array.isArray(req.files)) {
            const stage = req.body.stage || 'before';
            for (const file of req.files) {
                const url = await (0, upload_js_1.processUploadedFile)(file);
                progressPhotos.push({
                    url,
                    caption: req.body.caption || 'Initial photo',
                    stage,
                    uploadedAt: new Date(),
                });
            }
        }
        const initialHistory = [
            {
                action: 'Task Created',
                changedBy: userName,
                timestamp: new Date(),
                newStatus: status || 'not_started',
                notes: `Created task "${taskName}" for property ${propertyDoc.name}`,
            },
        ];
        const task = await Task_js_1.Task.create({
            property,
            taskName,
            description: description || '',
            category,
            assignedWorker,
            workerPhone: workerPhone || '',
            startDate: new Date(startDate),
            dueDate: new Date(dueDate),
            priority: priority || 'medium',
            estimatedCost: Number(estimatedCost) || 0,
            actualCost: Number(actualCost) || 0,
            notes: notes || '',
            status: status || 'not_started',
            progressPhotos,
            history: initialHistory,
            completedDate: status === 'completed' ? new Date() : undefined,
            createdBy: userId,
        });
        await (0, propertyController_js_1.recalculatePropertyProgress)(property);
        const populated = await Task_js_1.Task.findById(task._id).populate({
            path: 'property',
            populate: { path: 'owner' },
        });
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task: populated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const userId = req.user?._id;
        const task = await Task_js_1.Task.findOne({ _id: req.params.id, createdBy: userId });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        const { taskName, description, category, assignedWorker, workerPhone, startDate, dueDate, priority, estimatedCost, actualCost, notes, status, property, } = req.body;
        const userName = req.user ? req.user.name : 'Project Manager';
        const oldStatus = task.status;
        if (taskName)
            task.taskName = taskName;
        if (description !== undefined)
            task.description = description;
        if (category)
            task.category = category;
        if (assignedWorker)
            task.assignedWorker = assignedWorker;
        if (workerPhone !== undefined)
            task.workerPhone = workerPhone;
        if (startDate)
            task.startDate = new Date(startDate);
        if (dueDate)
            task.dueDate = new Date(dueDate);
        if (priority)
            task.priority = priority;
        if (estimatedCost !== undefined)
            task.estimatedCost = Number(estimatedCost);
        if (actualCost !== undefined)
            task.actualCost = Number(actualCost);
        if (notes !== undefined)
            task.notes = notes;
        if (property) {
            const propExists = await Property_js_1.Property.findOne({ _id: property, createdBy: userId });
            if (!propExists) {
                res.status(400).json({ success: false, message: 'Invalid property specified.' });
                return;
            }
            task.property = property;
        }
        let statusChanged = false;
        if (status && status !== oldStatus) {
            statusChanged = true;
            task.status = status;
            if (status === 'completed' && !task.completedDate) {
                task.completedDate = new Date();
            }
            else if (status !== 'completed') {
                task.completedDate = undefined;
            }
            task.history.push({
                action: 'Status Change',
                changedBy: userName,
                timestamp: new Date(),
                previousStatus: oldStatus,
                newStatus: status,
                notes: `Status changed from ${oldStatus.replace('_', ' ')} to ${status.replace('_', ' ')}`,
            });
        }
        else {
            task.history.push({
                action: 'Task Details Updated',
                changedBy: userName,
                timestamp: new Date(),
                notes: 'Task details updated',
            });
        }
        await task.save();
        await (0, propertyController_js_1.recalculatePropertyProgress)(task.property.toString());
        const updated = await Task_js_1.Task.findById(task._id).populate({
            path: 'property',
            populate: { path: 'owner' },
        });
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            statusChanged,
            task: updated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating task' });
    }
};
exports.updateTask = updateTask;
const updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { status, actualCost, notes } = req.body;
        const task = await Task_js_1.Task.findOne({ _id: req.params.id, createdBy: userId });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        const userName = req.user ? req.user.name : 'Supervisor';
        const oldStatus = task.status;
        task.status = status;
        if (status === 'completed') {
            task.completedDate = new Date();
        }
        else {
            task.completedDate = undefined;
        }
        if (actualCost !== undefined) {
            task.actualCost = Number(actualCost);
        }
        task.history.push({
            action: 'Quick Status Update',
            changedBy: userName,
            timestamp: new Date(),
            previousStatus: oldStatus,
            newStatus: status,
            notes: notes || `Moved to ${status.replace('_', ' ')}`,
        });
        await task.save();
        await (0, propertyController_js_1.recalculatePropertyProgress)(task.property.toString());
        const populated = await Task_js_1.Task.findById(task._id).populate({
            path: 'property',
            populate: { path: 'owner' },
        });
        res.status(200).json({
            success: true,
            message: `Task marked as ${status.replace('_', ' ')}`,
            task: populated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating status' });
    }
};
exports.updateTaskStatus = updateTaskStatus;
const uploadTaskPhotos = async (req, res) => {
    try {
        const userId = req.user?._id;
        const task = await Task_js_1.Task.findOne({ _id: req.params.id, createdBy: userId });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ success: false, message: 'No image files uploaded.' });
            return;
        }
        const stage = req.body.stage || 'during';
        const caption = req.body.caption || `${stage} work documentation`;
        const userName = req.user ? req.user.name : 'Site Inspector';
        const uploadedUrls = [];
        for (const file of req.files) {
            const url = await (0, upload_js_1.processUploadedFile)(file);
            uploadedUrls.push(url);
            task.progressPhotos.push({
                url,
                caption,
                stage,
                uploadedAt: new Date(),
            });
        }
        task.history.push({
            action: 'Photos Uploaded',
            changedBy: userName,
            timestamp: new Date(),
            notes: `Added ${uploadedUrls.length} progress photo(s) [${stage} stage]`,
        });
        await task.save();
        res.status(200).json({
            success: true,
            message: `Successfully uploaded ${uploadedUrls.length} photo(s)`,
            task,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error uploading photos' });
    }
};
exports.uploadTaskPhotos = uploadTaskPhotos;
const deleteTask = async (req, res) => {
    try {
        const userId = req.user?._id;
        const task = await Task_js_1.Task.findOne({ _id: req.params.id, createdBy: userId });
        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        const propertyId = task.property.toString();
        await Task_js_1.Task.findByIdAndDelete(req.params.id);
        await (0, propertyController_js_1.recalculatePropertyProgress)(propertyId);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting task' });
    }
};
exports.deleteTask = deleteTask;
