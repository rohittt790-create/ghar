"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const Owner_js_1 = require("../models/Owner.js");
const Property_js_1 = require("../models/Property.js");
const Task_js_1 = require("../models/Task.js");
const Floor_js_1 = require("../models/Floor.js");
const Room_js_1 = require("../models/Room.js");
const Resident_js_1 = require("../models/Resident.js");
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user?._id;
        const totalOwners = await Owner_js_1.Owner.countDocuments({ createdBy: userId });
        const totalProperties = await Property_js_1.Property.countDocuments({ createdBy: userId });
        const tasks = await Task_js_1.Task.find({ createdBy: userId }).populate({
            path: 'property',
            select: 'name propertyId coverPhoto owner',
            populate: { path: 'owner', select: 'name phone email' },
        });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const notStartedTasks = tasks.filter((t) => t.status === 'not_started').length;
        const onHoldTasks = tasks.filter((t) => t.status === 'on_hold').length;
        const now = new Date();
        const overdueTasks = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now);
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const upcomingDeadlines = tasks
            .filter((t) => t.status !== 'completed' && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDaysFromNow)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        // Properties list with progress for this user
        const properties = await Property_js_1.Property.find({ createdBy: userId })
            .populate('owner', 'name phone email profilePicture address city state zipCode emergencyContact')
            .sort({ updatedAt: -1 });
        const totalBudget = properties.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);
        const totalSpent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
        // Overall construction progress
        const overallProgress = totalTasks > 0
            ? Math.round(((completedTasks + inProgressTasks * 0.4) / totalTasks) * 100)
            : 0;
        // Recent photos extracted from this user's tasks
        const allPhotos = [];
        // Recent activities compiled from this user's task histories
        const recentActivities = [];
        tasks.forEach((t) => {
            const propName = t.property?.name || 'Property';
            const propId = t.property?.propertyId || '';
            if (t.progressPhotos && t.progressPhotos.length > 0) {
                t.progressPhotos.forEach((p) => {
                    allPhotos.push({
                        url: p.url,
                        caption: p.caption,
                        stage: p.stage,
                        uploadedAt: p.uploadedAt,
                        taskName: t.taskName,
                        taskId: t._id.toString(),
                        propertyName: propName,
                        propertyId: propId,
                    });
                });
            }
            if (t.history && t.history.length > 0) {
                t.history.forEach((h) => {
                    recentActivities.push({
                        action: h.action,
                        changedBy: h.changedBy,
                        timestamp: h.timestamp,
                        notes: h.notes,
                        taskName: t.taskName,
                        taskId: t._id.toString(),
                        propertyName: propName,
                    });
                });
            }
        });
        // Sort photos and activities by newest first
        allPhotos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // House Structure & Residents telemetry
        const { propertyId, floorId } = req.query;
        const floorQuery = { createdBy: userId };
        const roomQuery = { createdBy: userId };
        const residentQuery = { createdBy: userId, status: 'currently_living' };
        if (propertyId) {
            floorQuery.property = propertyId;
            roomQuery.property = propertyId;
            residentQuery.property = propertyId;
        }
        if (floorId) {
            roomQuery.floor = floorId;
            residentQuery.currentFloor = floorId;
        }
        const [totalFloors, allRooms, activeResidents] = await Promise.all([
            Floor_js_1.Floor.countDocuments(floorQuery),
            Room_js_1.Room.find(roomQuery),
            Resident_js_1.Resident.find(residentQuery),
        ]);
        const totalRooms = allRooms.length;
        const totalBedrooms = allRooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom').length;
        const totalBathrooms = allRooms.filter((r) => r.roomType === 'bathroom').length;
        const totalActiveResidents = activeResidents.length;
        const activeResidentRoomIds = new Set(activeResidents
            .filter((r) => r.currentRoom)
            .map((r) => r.currentRoom.toString()));
        const bedrooms = allRooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom');
        const occupiedBedrooms = bedrooms.filter((b) => activeResidentRoomIds.has(b._id.toString())).length;
        const vacantBedrooms = Math.max(0, bedrooms.length - occupiedBedrooms);
        const roomsUnderMaintenance = allRooms.filter((r) => r.constructionStatus === 'in_progress' ||
            r.constructionStatus === 'needs_repair' ||
            r.occupancyStatus === 'under_maintenance').length;
        res.status(200).json({
            success: true,
            counts: {
                totalOwners,
                totalProperties,
                totalTasks,
                completedTasks,
                inProgressTasks,
                notStartedTasks,
                onHoldTasks,
                overdueTasksCount: overdueTasks.length,
            },
            structure: {
                totalFloors,
                totalRooms,
                totalBedrooms,
                totalBathrooms,
                totalActiveResidents,
                occupiedBedrooms,
                vacantBedrooms,
                roomsUnderMaintenance,
            },
            overallProgress,
            financials: {
                totalBudget,
                totalSpent,
                variance: totalSpent - totalBudget,
            },
            upcomingDeadlines: upcomingDeadlines.slice(0, 6),
            overdueTasks: overdueTasks.slice(0, 6),
            recentPhotos: allPhotos.slice(0, 8),
            recentActivities: recentActivities.slice(0, 10),
            properties: properties.slice(0, 5),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching dashboard summary' });
    }
};
exports.getDashboardSummary = getDashboardSummary;
