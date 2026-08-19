import { Router } from 'express';
import multer from 'multer';
import { verifyAdmin } from '../middleware/adminAuth.js';
import { validateBody, uploadMetadataSchema } from '../utils/validators.js';
import { uploadPdf } from '../controllers/upload.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});

// POST /api/upload  (admin only, PDF only)
router.post(
  '/',
  verifyAdmin,
  upload.single('file'),
  validateBody(uploadMetadataSchema),
  uploadPdf
);

export default router;
