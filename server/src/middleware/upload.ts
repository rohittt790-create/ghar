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
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
      return result.secure_url;
    } catch (err) {
      console.error('[Upload] Cloudinary upload failed:', err);
    }
  }

  // Convert uploaded image directly into Base64 Data URI
  // This stores the image bytes right inside the MongoDB document.
  // It guarantees that images will NEVER break or be lost on serverless
  // platforms like Vercel and Netlify where local disk is read-only / ephemeral.
  try {
    if (file.path && fs.existsSync(file.path)) {
      const fileBuffer = fs.readFileSync(file.path);
      const mime = file.mimetype || 'image/jpeg';
      const base64Data = `data:${mime};base64,${fileBuffer.toString('base64')}`;
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
      return base64Data;
    }
  } catch (err) {
    console.error('[Upload] Error reading uploaded file to base64:', err);
  }

  return `/uploads/${file.filename}`;
};
