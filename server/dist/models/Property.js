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
exports.Property = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PropertySchema = new mongoose_1.Schema({
    propertyId: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Owner', required: true },
    startDate: { type: Date, required: true },
    expectedCompletionDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    status: {
        type: String,
        enum: ['planning', 'in_progress', 'completed', 'on_hold'],
        default: 'in_progress',
    },
    propertyPhotos: [{ type: String }],
    coverPhoto: { type: String, default: '' },
    estimatedBudget: { type: Number, default: 0 },
    actualExpenses: { type: Number, default: 0 },
    squareFeet: { type: Number, default: 0 },
    propertyType: {
        type: String,
        enum: ['residential', 'commercial', 'renovation', 'villa', 'duplex', 'other'],
        default: 'residential',
    },
    notes: { type: String, default: '' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
PropertySchema.index({ propertyId: 1, createdBy: 1 }, { unique: true });
PropertySchema.index({ name: 'text', address: 'text', city: 'text' });
PropertySchema.index({ owner: 1 });
exports.Property = mongoose_1.default.model('Property', PropertySchema);
