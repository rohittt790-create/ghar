"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProgressPhotoSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    stage: {
        type: String,
        enum: ['before', 'during', 'after'],
        default: 'during',
    },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: true });
const TaskHistorySchema = new mongoose_1.Schema({
    action: { type: String, required: true },
    changedBy: { type: String, default: 'Admin' },
    timestamp: { type: Date, default: Date.now },
    previousStatus: { type: String },
    newStatus: { type: String },
    notes: { type: String },
}, { _id: true });
const TaskSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    taskName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
        type: String,
        enum: [
            'Foundation',
            'Framing',
            'Roofing',
            'Plumbing',
            'Electrical',
            'HVAC',
            'Drywall',
            'Painting',
            'Flooring',
            'Masonry',
            'Carpentry',
            'Landscaping',
            'Inspection',
            'Exterior',
            'Interior Finish',
            'Other',
        ],
        default: 'Other',
    },
    assignedWorker: { type: String, required: true, trim: true },
    workerPhone: { type: String, default: '' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
        default: 'not_started',
    },
    progressPhotos: [ProgressPhotoSchema],
    history: [TaskHistorySchema],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for isOverdue
TaskSchema.virtual('isOverdue').get(function () {
    if (this.status === 'completed')
        return false;
    const now = new Date();
    return new Date(this.dueDate) < now;
});
TaskSchema.index({ property: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ taskName: 'text', description: 'text', assignedWorker: 'text' });
exports.Task = mongoose_1.default.model('Task', TaskSchema);
