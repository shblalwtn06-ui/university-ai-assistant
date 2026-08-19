import { Router } from 'express';
import { verifyUser } from '../middleware/auth.js';
import { validateBody, onboardingSchema } from '../utils/validators.js';
import { getMe, onboardStudent } from '../controllers/students.controller.js';

const router = Router();

router.get('/me', verifyUser, getMe);
router.post('/onboard', verifyUser, validateBody(onboardingSchema), onboardStudent);

export default router;
