import express from 'express';
import { CommentController } from '../controllers/commentController.js';
import { validate, commentSchema, validatePagination } from '../middleware/validation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - all comment operations require authentication
router.get('/', protect, validatePagination, CommentController.getAllComments);
router.get('/:id', protect, CommentController.getComment);
router.put('/:id', protect, authorize('comment'), validate(commentSchema), CommentController.updateComment);
router.delete('/:id', protect, authorize('comment'), CommentController.deleteComment);

export default router;