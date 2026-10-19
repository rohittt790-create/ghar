"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveAlerts = exports.deleteReminder = exports.updateReminderStatus = exports.createReminder = exports.getReminders = void 0;
const Reminder_js_1 = require("../models/Reminder.js");
const Task_js_1 = require("../models/Task.js");
const getReminders = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { status, property, date, priority } = req.query;
        const filter = { createdBy: userId };
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (property && property !== 'all') {
            filter.property = property;
        }
        if (priority && priority !== 'all') {
            filter.priority = priority;
        }
        if (date) {
            filter.reminderDate = date;
        }
        const reminders = await Reminder_js_1.Reminder.find(filter)
            .populate('property', 'name propertyId coverPhoto')
            .populate('task', 'taskName dueDate priority status')
            .sort({ reminderDate: 1, reminderTime: 1 });
        res.status(200).json({
            success: true,
            count: reminders.length,
            reminders,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching reminders' });
    }
};
exports.getReminders = getReminders;
const createReminder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { title, description, property, task, reminderDate, reminderTime, type, priority, channels, } = req.body;
        if (!title || !reminderDate) {
            res.status(400).json({ success: false, message: 'Title and Reminder Date are required.' });
            return;
        }
        // Generate unique notification key to prevent duplicates per user
        const notificationKey = `${userId}-${task || property || 'gen'}-${reminderDate}-${reminderTime || '09:00'}-${type || 'deadline'}`;
        const existing = await Reminder_js_1.Reminder.findOne({ notificationKey, createdBy: userId, status: { $ne: 'dismissed' } });
        if (existing) {
            res.status(400).json({
                success: false,
                message: 'A reminder for this item and date/time already exists.',
            });
            return;
        }
        const reminder = await Reminder_js_1.Reminder.create({
            title,
            description: description || '',
            property: property || undefined,
            task: task || undefined,
            reminderDate,
            reminderTime: reminderTime || '09:00',
            type: type || 'deadline',
            priority: priority || 'medium',
            channels: channels || ['browser', 'in_app'],
            status: 'pending',
            notificationKey,
            createdBy: userId,
        });
        const populated = await Reminder_js_1.Reminder.findById(reminder._id)
            .populate('property', 'name propertyId')
            .populate('task', 'taskName dueDate');
        res.status(201).json({
            success: true,
            message: 'Reminder created successfully',
            reminder: populated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating reminder' });
    }
};
exports.createReminder = createReminder;
const updateReminderStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { status } = req.body;
        const reminder = await Reminder_js_1.Reminder.findOne({ _id: req.params.id, createdBy: userId });
        if (!reminder) {
            res.status(404).json({ success: false, message: 'Reminder not found' });
            return;
        }
        reminder.status = status;
        if (status === 'sent') {
            reminder.sentAt = new Date();
        }
        await reminder.save();
        res.status(200).json({
            success: true,
            message: `Reminder status updated to ${status}`,
            reminder,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating reminder status' });
    }
};
exports.updateReminderStatus = updateReminderStatus;
const deleteReminder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const reminder = await Reminder_js_1.Reminder.findOneAndDelete({ _id: req.params.id, createdBy: userId });
        if (!reminder) {
            res.status(404).json({ success: false, message: 'Reminder not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Reminder deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting reminder' });
    }
};
exports.deleteReminder = deleteReminder;
/**
 * Returns reminders and notifications due right now or upcoming today,
 * plus automatically identified upcoming task deadlines (within 48 hours).
 */
const getActiveAlerts = async (req, res) => {
    try {
        const userId = req.user?._id;
        const today = new Date().toISOString().split('T')[0];
        const twoDaysAhead = new Date(Date.now() + 48 * 60 * 60 * 1000);
        // Explicit pending reminders due on or before today
        const pendingReminders = await Reminder_js_1.Reminder.find({
            createdBy: userId,
            status: 'pending',
            reminderDate: { $lte: today },
        })
            .populate('property', 'name propertyId')
            .populate('task', 'taskName dueDate priority');
        // Overdue tasks
        const overdueTasks = await Task_js_1.Task.find({
            createdBy: userId,
            status: { $ne: 'completed' },
            dueDate: { $lt: new Date() },
        })
            .populate('property', 'name propertyId')
            .sort({ dueDate: 1 })
            .limit(10);
        // Upcoming tasks (due within 48h)
        const upcomingTasks = await Task_js_1.Task.find({
            createdBy: userId,
            status: { $ne: 'completed' },
            dueDate: { $gte: new Date(), $lte: twoDaysAhead },
        })
            .populate('property', 'name propertyId')
            .sort({ dueDate: 1 })
            .limit(10);
        res.status(200).json({
            success: true,
            pendingReminders,
            overdueTasks,
            upcomingTasks,
            totalAlerts: pendingReminders.length + overdueTasks.length + upcomingTasks.length,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching active alerts' });
    }
};
exports.getActiveAlerts = getActiveAlerts;
