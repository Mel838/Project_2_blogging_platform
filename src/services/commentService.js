import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class CommentService {
  // Get all comments with pagination
  static async getAllComments(limit = 10, offset = 0) {
    const result = await client(`
      SELECT 
        c.comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username,
        u.user_id,
        p.title as post_title,
        p.post_id
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN posts p ON c.post_id = p.post_id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows;
  }

  // Get single comment by ID
  static async getCommentById(commentId) {
    const result = await client(`
      SELECT 
        c.comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username,
        u.user_id,
        p.title as post_title,
        p.post_id
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN posts p ON c.post_id = p.post_id
      WHERE c.comment_id = $1
    `, [commentId]);

    if (result.rows.length === 0) {
      throw new AppError('Comment not found', 404);
    }

    return result.rows[0];
  }

  // Update comment
  static async updateComment(commentId, updateData) {
    const { content } = updateData;

    const result = await client(`
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE comment_id = $2
      RETURNING comment_id, content, created_at, updated_at
    `, [content, commentId]);

    if (result.rows.length === 0) {
      throw new AppError('Comment not found', 404);
    }

    return result.rows[0];
  }

  // Delete comment
  static async deleteComment(commentId) {
    const result = await client(
      'DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id',
      [commentId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Comment not found', 404);
    }

    return result.rows[0];
  }

  // Get comments by user
  static async getCommentsByUser(userId, limit = 10, offset = 0) {
    const result = await client(`
      SELECT 
        c.comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        p.title as post_title,
        p.post_id
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.post_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    return result.rows;
  }
}