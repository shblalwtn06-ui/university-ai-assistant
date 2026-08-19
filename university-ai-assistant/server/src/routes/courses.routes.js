import { Router } from 'express';
import { verifyUser } from '../middleware/auth.js';
import { listCourses } from '../controllers/courses.controller.js';

const router = Router();

router.get('/', verifyUser, listCourses);

export default router;
