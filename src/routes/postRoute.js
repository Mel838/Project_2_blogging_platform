import express from 'express';
import { PostController } from '../controllers/postController.js';
import { validate, postSchema, commentSchema, validatePagination } from '../middleware/validation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, PostController.getAllPosts);
router.get('/search', validatePagination, PostController.searchPosts);
router.get('/:id', PostController.getPost);
router.get('/:id/comments', PostController.getPostComments);

// Protected routes
router.post('/', protect, validate(postSchema), PostController.createPost);
router.put('/:id', protect, authorize('post'), validate(postSchema), PostController.updatePost);
router.delete('/:id', protect, authorize('post'), PostController.deletePost);

// Comment routes
router.post('/:id/comments', protect, validate(commentSchema), PostController.addComment);

export default router;