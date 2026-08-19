import { z } from 'zod';
import { AppError } from '../middleware/errorHandler.js';

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, 'Question must be at least 2 characters long.')
    .max(2000, 'Question must be under 2000 characters.'),
  courseId: z.string().uuid().optional().nullable(),
  topK: z.number().int().min(1).max(20).optional(),
});

export const uploadMetadataSchema = z.object({
  courseId: z.string().uuid('courseId must be a valid UUID.'),
});

export const onboardingSchema = z.object({
  academicId: z
    .string()
    .trim()
    .min(3, 'Academic ID must be at least 3 characters.')
    .max(50, 'Academic ID must be under 50 characters.'),
  fullName: z.string().trim().min(2).max(120),
});

/**
 * validateBody
 * ------------
 * Express middleware factory: validates req.body against a Zod
 * schema and replaces req.body with the parsed/sanitized result.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(' | ');
      return next(new AppError(message, 400));
    }
    req.body = result.data;
    next();
  };
}
