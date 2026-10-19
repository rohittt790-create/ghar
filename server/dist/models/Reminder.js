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
exports.Reminder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ReminderSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task' },
    reminderDate: { type: String, required: true }, // Format YYYY-MM-DD
    reminderTime: { type: String, default: '09:00' }, // Format HH:mm
    type: {
        type: String,
        enum: ['deadline', 'inspection', 'task_due', 'payment', 'general'],
        default: 'deadline',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'dismissed'],
        default: 'pending',
    },
    channels: [
        {
            type: String,
            enum: ['browser', 'in_app', 'email', 'whatsapp'],
            default: ['browser', 'in_app'],
        },
    ],
    sentAt: { type: Date },
    notificationKey: { type: String, index: true },
}, { timestamps: true });
ReminderSchema.index({ reminderDate: 1, status: 1 });
ReminderSchema.index({ property: 1 });
exports.Reminder = mongoose_1.default.model('Reminder', ReminderSchema);
