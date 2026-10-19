import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

import os from 'os';

const isServerless = Boolean(
  process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
);

// Ensure uploads folder exists (use /tmp on Vercel / Netlify / Lambda read-only environment)
const uploadsDir = isServerless
  ? path.resolve(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('[Upload] Warning: Could not create uploads directory:', e);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
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
export const processUploadedFile = async (file: Express.Multer.File): Promise<string> => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hometrack',
      });
      // Optionally clean up local file
      fs.unlink(file.path, () => {});
      return result.secure_url;
    } catch (err) {
      console.error('[Upload] Cloudinary upload failed, falling back to local file:', err);
      return `/uploads/${file.filename}`;
    }
  }
  return `/uploads/${file.filename}`;
};
