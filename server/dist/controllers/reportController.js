"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyReport = void 0;
const Task_js_1 = require("../models/Task.js");
const Property_js_1 = require("../models/Property.js");
const Owner_js_1 = require("../models/Owner.js");
const generateMonthlyReport = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1, // 1-12
        propertyId, ownerId, category, startDate: customStart, endDate: customEnd, } = req.query;
        const y = Number(year);
        const m = Number(month);
        // Compute month date range
        let startPeriod;
        let endPeriod;
        if (customStart && customEnd) {
            startPeriod = new Date(String(customStart));
            endPeriod = new Date(String(customEnd));
            endPeriod.setHours(23, 59, 59, 999);
        }
        else {
            startPeriod = new Date(y, m - 1, 1);
            endPeriod = new Date(y, m, 0, 23, 59, 59, 999);
        }
        // Build base filter scoped to user
        const taskFilter = { createdBy: userId };
        if (category && category !== 'all') {
            taskFilter.category = category;
        }
        // If ownerId provided, find owner's properties first (for this user)
        let propertyIds = [];
        if (ownerId && ownerId !== 'all') {
            const ownerProperties = await Property_js_1.Property.find({ owner: ownerId, createdBy: userId }).select('_id');
            propertyIds = ownerProperties.map((p) => p._id);
            taskFilter.property = { $in: propertyIds };
        }
        if (propertyId && propertyId !== 'all') {
            taskFilter.property = propertyId;
        }
        // Include tasks whose startDate or dueDate or completedDate overlaps the selected period
        taskFilter.$or = [
            { startDate: { $gte: startPeriod, $lte: endPeriod } },
            { dueDate: { $gte: startPeriod, $lte: endPeriod } },
            { completedDate: { $gte: startPeriod, $lte: endPeriod } },
            {
                startDate: { $lte: startPeriod },
                dueDate: { $gte: endPeriod },
            },
        ];
        const tasks = await Task_js_1.Task.find(taskFilter)
            .populate({
            path: 'property',
            select: 'name propertyId address owner estimatedBudget actualExpenses coverPhoto',
            populate: { path: 'owner', select: 'name phone email profilePicture' },
        })
            .sort({ dueDate: 1 });
        // Task counts
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const notStartedTasks = tasks.filter((t) => t.status === 'not_started').length;
        const onHoldTasks = tasks.filter((t) => t.status === 'on_hold').length;
        const overdueTasks = tasks.filter((t) => {
            return t.status !== 'completed' && new Date(t.dueDate) < new Date();
        }).length;
        const progressPercentage = totalTasks > 0
            ? Math.round(((completedTasks + inProgressTasks * 0.4) / totalTasks) * 100)
            : 0;
        // Financial Analysis (Estimated vs Actual)
        let totalEstimatedCost = 0;
        let totalActualCost = 0;
        const categoryStats = {};
        // Photo records collected during this month
        const photoRecords = [];
        // Daily completion trend for this month (days 1 to 31)
        const daysInMonth = new Date(y, m, 0).getDate();
        const dailyActivity = {};
        for (let d = 1; d <= daysInMonth; d++) {
            dailyActivity[d] = { completed: 0, started: 0 };
        }
        tasks.forEach((task) => {
            totalEstimatedCost += task.estimatedCost || 0;
            totalActualCost += task.actualCost || 0;
            // Category map
            if (!categoryStats[task.category]) {
                categoryStats[task.category] = {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    estimatedCost: 0,
                    actualCost: 0,
                };
            }
            categoryStats[task.category].total += 1;
            if (task.status === 'completed')
                categoryStats[task.category].completed += 1;
            if (task.status === 'in_progress')
                categoryStats[task.category].inProgress += 1;
            categoryStats[task.category].estimatedCost += task.estimatedCost || 0;
            categoryStats[task.category].actualCost += task.actualCost || 0;
            // Check daily completed activity
            if (task.completedDate) {
                const cDate = new Date(task.completedDate);
                if (cDate.getFullYear() === y && cDate.getMonth() + 1 === m) {
                    const day = cDate.getDate();
                    if (dailyActivity[day]) {
                        dailyActivity[day].completed += 1;
                    }
                }
            }
            // Check daily started activity
            if (task.startDate) {
                const sDate = new Date(task.startDate);
                if (sDate.getFullYear() === y && sDate.getMonth() + 1 === m) {
                    const day = sDate.getDate();
                    if (dailyActivity[day]) {
                        dailyActivity[day].started += 1;
                    }
                }
            }
            // Extract photo records
            if (task.progressPhotos && task.progressPhotos.length > 0) {
                const propName = task.property?.name || 'Property';
                task.progressPhotos.forEach((photo) => {
                    photoRecords.push({
                        taskId: task._id.toString(),
                        taskName: task.taskName,
                        propertyName: propName,
                        stage: photo.stage,
                        url: photo.url,
                        caption: photo.caption,
                        uploadedAt: photo.uploadedAt,
                    });
                });
            }
        });
        const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
            category,
            total: stats.total,
            completed: stats.completed,
            inProgress: stats.inProgress,
            estimatedCost: stats.estimatedCost,
            actualCost: stats.actualCost,
            variance: stats.actualCost - stats.estimatedCost,
            progress: Math.round((stats.completed / (stats.total || 1)) * 100),
        }));
        const dailyActivityChart = Object.entries(dailyActivity).map(([day, val]) => ({
            day: `Day ${day}`,
            dayNumber: Number(day),
            completed: val.completed,
            started: val.started,
        }));
        // Details for selected Property or Owner if filtered
        let propertyInfo = null;
        if (propertyId && propertyId !== 'all') {
            propertyInfo = await Property_js_1.Property.findOne({ _id: propertyId, createdBy: userId }).populate('owner');
        }
        let ownerInfo = null;
        if (ownerId && ownerId !== 'all') {
            ownerInfo = await Owner_js_1.Owner.findOne({ _id: ownerId, createdBy: userId });
        }
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        res.status(200).json({
            success: true,
            reportMetadata: {
                year: y,
                month: m,
                monthName: monthNames[m - 1] || `Month ${m}`,
                startDate: startPeriod,
                endDate: endPeriod,
                generatedAt: new Date(),
                propertyInfo,
                ownerInfo,
                filterCategory: category || 'all',
            },
            summary: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                notStartedTasks,
                onHoldTasks,
                overdueTasks,
                progressPercentage,
                totalEstimatedCost,
                totalActualCost,
                costVariance: totalActualCost - totalEstimatedCost,
                budgetHealth: totalActualCost <= totalEstimatedCost
                    ? 'Within Budget'
                    : `Over Budget by ₹${(totalActualCost - totalEstimatedCost).toLocaleString('en-IN')}`,
            },
            categoryBreakdown,
            dailyActivityChart,
            photoRecords,
            tasks,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error generating report' });
    }
};
exports.generateMonthlyReport = generateMonthlyReport;
