import { CommentService } from '../services/commentService.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CommentController {
  // Get all comments (admin functionality)
  static getAllComments = catchAsync(async (req, res) => {
    const { limit, offset } = req.pagination;
    const comments = await CommentService.getAllComments(limit, offset);

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

  // Get single comment
  static getComment = catchAsync(async (req, res) => {
    const comment = await CommentService.getCommentById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        comment
      }
    });
  });

  // Update comment
  static updateComment = catchAsync(async (req, res) => {
    const comment = await CommentService.updateComment(req.params.id, req.body);

    logger.info(`Comment updated by user ${req.user.username}: ID ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment
      }
    });
  });

  // Delete comment
  static deleteComment = catchAsync(async (req, res) => {
    await CommentService.deleteComment(req.params.id);

    logger.info(`Comment deleted by user ${req.user.username}: ID ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  });
}