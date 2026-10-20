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
exports.Room = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DefectSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    reportedDate: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedDate: { type: Date },
    notes: { type: String, default: '' },
}, { _id: true });
const RoomSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    floor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    roomId: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    roomType: {
        type: String,
        enum: [
            'bedroom',
            'master_bedroom',
            'living_room',
            'hall',
            'kitchen',
            'bathroom',
            'dining_room',
            'study_room',
            'store_room',
            'utility_room',
            'balcony',
            'pooja_room',
            'other',
        ],
        required: true,
        default: 'bedroom',
    },
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 10 },
    },
    areaSqFt: { type: Number, default: 0 },
    photos: [{ type: String }],
    floorPlanLocation: { type: String, default: '' },
    constructionStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'needs_repair'],
        default: 'in_progress',
    },
    interiorStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started',
    },
    checklist: {
        electrical: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
        plumbing: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
        flooring: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
        painting: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
        doors: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
        windows: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'not_applicable'],
            default: 'not_started',
        },
    },
    occupancyStatus: {
        type: String,
        enum: ['occupied', 'vacant', 'under_maintenance'],
        default: 'vacant',
    },
    defects: [DefectSchema],
    notes: { type: String, default: '' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// Pre-save hook to calculate areaSqFt
RoomSchema.pre('save', function (next) {
    if (this.dimensions && this.dimensions.length && this.dimensions.width) {
        this.areaSqFt = Math.round(this.dimensions.length * this.dimensions.width * 100) / 100;
    }
    next();
});
exports.Room = mongoose_1.default.model('Room', RoomSchema);
