import { UserService } from '../services/userService.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class UserController {
  // Get current user profile
  static getMe = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.user.user_id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  });

  // Update user profile
  static updateMe = catchAsync(async (req, res) => {
    const user = await UserService.updateUser(req.user.user_id, req.body);

    logger.info(`User profile updated: ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  });

  // Upload profile picture 
  static uploadProfilePicture = catchAsync(async (req, res) => {
    const { profile_picture } = req.body;

    const user = await UserService.updateProfilePicture(req.user.user_id, profile_picture);

    logger.info(`Profile picture updated for user: ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user
      }
    });
  });

  // Get user's posts
  static getUserPosts = catchAsync(async (req, res) => {
    const { limit, offset } = req.pagination;
    const posts = await UserService.getUserPosts(req.user.user_id, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          limit,
          offset,
          total: posts.length
        }
      }
    });
  });

  // Get user's comments
  static getUserComments = catchAsync(async (req, res) => {
    const { limit, offset } = req.pagination;
    const comments = await UserService.getUserComments(req.user.user_id, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          limit,
          offset,
          total: comments.length
        }
      }
    });
  });

  // Get all users (admin functionality)
  static getAllUsers = catchAsync(async (req, res) => {
    const { limit, offset } = req.pagination;
    const users = await UserService.getAllUsers(limit, offset);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          limit,
          offset,
          total: users.length
        }
      }
    });
  });
}