import { Router } from 'express';
import { verifyUser } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/adminAuth.js';
import { listFiles, deleteFile } from '../controllers/files.controller.js';

const router = Router();

// GET /api/files — any authenticated student can view the file list
router.get('/', verifyUser, listFiles);

// DELETE /api/files/:id — admin only
router.delete('/:id', verifyAdmin, deleteFile);

export default router;
