import { PostService } from '../services/postService.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class PostController {
  // Get all posts with paging
  static getAllPosts = catchAsync(async (req, res) => {
    const { limit, offset } = req.pagination;
    const posts = await PostService.getAllPosts(limit, offset);

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

  // Get single post with comments
  static getPost = catchAsync(async (req, res) => {
    const post = await PostService.getPostById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        post
      }
    });
  });

  // Create new post
  static createPost = catchAsync(async (req, res) => {
    const postData = {
      ...req.body,
      user_id: req.user.user_id
    };

    const post = await PostService.createPost(postData);

    logger.info(`Post created by user ${req.user.username}: ${post.title}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post
      }
    });
  });

  // Update post
  static updatePost = catchAsync(async (req, res) => {
    const post = await PostService.updatePost(req.params.id, req.body);

    logger.info(`Post updated by user ${req.user.username}: ${post.title}`);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post
      }
    });
  });

  // Delete post
  static deletePost = catchAsync(async (req, res) => {
    await PostService.deletePost(req.params.id);

    logger.info(`Post deleted by user ${req.user.username}: ID ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  });

  // Get post comments
  static getPostComments = catchAsync(async (req, res) => {
    const comments = await PostService.getPostComments(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        comments
      }
    });
  });

  // Add comment to post
  static addComment = catchAsync(async (req, res) => {
    const commentData = {
      ...req.body,
      post_id: req.params.id,
      user_id: req.user.user_id
    };

    const comment = await PostService.addComment(commentData);

    logger.info(`Comment added by user ${req.user.username} to post ${req.params.id}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment
      }
    });
  });

  // Search posts
  static searchPosts = catchAsync(async (req, res) => {
    const { q } = req.query;
    const { limit, offset } = req.pagination;

    const posts = await PostService.searchPosts(q, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        posts,
        search: q,
        pagination: {
          limit,
          offset,
          total: posts.length
        }
      }
    });
  });
}