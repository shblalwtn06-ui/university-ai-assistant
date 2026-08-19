import { Router } from 'express';
import { verifyUser } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { validateBody, chatRequestSchema } from '../utils/validators.js';
import { chat } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/chat  (auth required)
router.post('/', verifyUser, chatLimiter, validateBody(chatRequestSchema), chat);

export default router;
