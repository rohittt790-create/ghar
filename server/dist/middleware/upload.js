"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUploadedFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_js_1 = require("../config/cloudinary.js");
const os_1 = __importDefault(require("os"));
const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
// Ensure uploads folder exists (use /tmp on Vercel / Netlify / Lambda read-only environment)
const uploadsDir = isServerless
    ? path_1.default.resolve(os_1.default.tmpdir(), 'uploads')
    : path_1.default.resolve(process.cwd(), 'uploads');
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}
catch (e) {
    console.warn('[Upload] Warning: Could not create uploads directory:', e);
}
// Multer storage
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif|svg/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
    },
});
/**
 * Process an uploaded file: If Cloudinary is configured, upload and remove local temp file.
 * Otherwise, return the local file URL path.
 */
const processUploadedFile = async (file) => {
    if (cloudinary_js_1.isCloudinaryConfigured) {
        try {
            const result = await cloudinary_js_1.cloudinary.uploader.upload(file.path, {
                folder: 'hometrack',
            });
            // Optionally clean up local file
            fs_1.default.unlink(file.path, () => { });
            return result.secure_url;
        }
        catch (err) {
            console.error('[Upload] Cloudinary upload failed, falling back to local file:', err);
            return `/uploads/${file.filename}`;
        }
    }
    return `/uploads/${file.filename}`;
};
exports.processUploadedFile = processUploadedFile;
