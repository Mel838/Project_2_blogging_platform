import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class PostService {
  // Get all posts with pagination
  static async getAllPosts(limit = 10, offset = 0) {
    const result = await client(`
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        u.username,
        u.user_id,
        COUNT(c.comment_id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN comments c ON p.post_id = c.post_id
      GROUP BY p.post_id, u.user_id, u.username
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows;
  }

  // Get single post by ID with comments
  static async getPostById(postId) {
    // Get post details
    const postResult = await client(`
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        u.username,
        u.user_id
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = $1
    `, [postId]);

    if (postResult.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    // Get post comments
    const commentsResult = await client(`
      SELECT 
        c.comment_id,
        c.content,
        c.created_at,
        u.username,
        u.user_id
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);

    const post = postResult.rows[0];
    post.comments = commentsResult.rows;

    return post;
  }

  // Create new post
  static async createPost(postData) {
    const { title, content, user_id } = postData;

    const result = await client(`
      INSERT INTO posts (title, content, user_id) 
      VALUES ($1, $2, $3) 
      RETURNING post_id, title, content, created_at, updated_at
    `, [title, content, user_id]);

    return result.rows[0];
  }

  // Update post
  static async updatePost(postId, updateData) {
    const { title, content } = updateData;

    // Build dynamic update query
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramCount++}`);
      values.push(content);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(postId);

    const result = await client(`
      UPDATE posts 
      SET ${updateFields.join(', ')}
      WHERE post_id = $${paramCount}
      RETURNING post_id, title, content, created_at, updated_at
    `, values);

    if (result.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    return result.rows[0];
  }

  // Delete post
  static async deletePost(postId) {
    const result = await client(
      'DELETE FROM posts WHERE post_id = $1 RETURNING post_id',
      [postId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    return result.rows[0];
  }

  // Get post comments
  static async getPostComments(postId) {
    // First check if post exists
    const postExists = await client(
      'SELECT post_id FROM posts WHERE post_id = $1',
      [postId]
    );

    if (postExists.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    const result = await client(`
      SELECT 
        c.comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username,
        u.user_id
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);

    return result.rows;
  }

  // Add comment to post
  static async addComment(commentData) {
    const { post_id, content, user_id } = commentData;

    // Check if post exists
    const postExists = await client(
      'SELECT post_id FROM posts WHERE post_id = $1',
      [post_id]
    );

    if (postExists.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    const result = await client(`
      INSERT INTO comments (post_id, content, user_id) 
      VALUES ($1, $2, $3) 
      RETURNING comment_id, content, created_at, updated_at
    `, [post_id, content, user_id]);

    return result.rows[0];
  }

  // Search posts
  static async searchPosts(searchTerm, limit = 10, offset = 0) {
    if (!searchTerm) {
      throw new AppError('Search term is required', 400);
    }

    const result = await client(`
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        u.username,
        u.user_id,
        COUNT(c.comment_id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN comments c ON p.post_id = c.post_id
      WHERE 
        p.title ILIKE $1 OR 
        p.content ILIKE $1
      GROUP BY p.post_id, u.user_id, u.username
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [`%${searchTerm}%`, limit, offset]);

    return result.rows;
  }
}