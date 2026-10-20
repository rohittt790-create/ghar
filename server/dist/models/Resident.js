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
exports.Resident = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssignmentHistorySchema = new mongoose_1.Schema({
    room: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Room', required: true },
    floor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Floor', required: true },
    roomName: { type: String },
    floorName: { type: String },
    assignedDate: { type: Date, default: Date.now },
    vacatedDate: { type: Date },
    notes: { type: String, default: '' },
}, { _id: true });
const ResidentSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    name: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: '' },
    relationship: {
        type: String,
        enum: ['owner', 'spouse', 'child', 'parent', 'relative', 'tenant', 'other'],
        default: 'relative',
        required: true,
    },
    dob: { type: Date },
    age: { type: Number },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    currentFloor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Floor' },
    currentRoom: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Room' },
    moveInDate: { type: Date, default: Date.now },
    moveOutDate: { type: Date },
    status: {
        type: String,
        enum: ['currently_living', 'temporarily_away', 'moved_out'],
        default: 'currently_living',
        index: true,
    },
    notes: { type: String, default: '' },
    assignmentHistory: [AssignmentHistorySchema],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
exports.Resident = mongoose_1.default.model('Resident', ResidentSchema);
