import express from 'express';
import { UserController } from '../controllers/userController.js';
import { validatePagination } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// User profile routes
router.get('/me', UserController.getMe);
router.put('/me', UserController.updateMe);
router.post('/profile-upload', UserController.uploadProfilePicture);

// User content routes
router.get('/me/posts', validatePagination, UserController.getUserPosts);
router.get('/me/comments', validatePagination, UserController.getUserComments);

// Admin routes (any authenticated user can access)
router.get('/', validatePagination, UserController.getAllUsers);

export default router;