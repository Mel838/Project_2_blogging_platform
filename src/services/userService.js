import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserService {
  // Get user by ID
  static async getUserById(userId) {
    const result = await client(
      'SELECT user_id, username, email, profile_picture, created_at, updated_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  // Get all users with paging
  static async getAllUsers(limit = 10, offset = 0) {
    const result = await client(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.profile_picture,
        u.created_at,
        COUNT(DISTINCT p.post_id) as post_count,
        COUNT(DISTINCT c.comment_id) as comment_count
      FROM users u
      LEFT JOIN posts p ON u.user_id = p.user_id
      LEFT JOIN comments c ON u.user_id = c.user_id
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows;
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    const { username, email } = updateData;

    // Build dynamic update query
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (username !== undefined) {
      updateFields.push(`username = $${paramCount++}`);
      values.push(username);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await client(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, username, email, profile_picture, created_at, updated_at
    `, values);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  // Update profile picture
  static async updateProfilePicture(userId, profilePicture) {
    const result = await client(`
      UPDATE users 
      SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id, username, email, profile_picture, created_at, updated_at
    `, [profilePicture, userId]);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  // Get user's posts
  static async getUserPosts(userId, limit = 10, offset = 0) {
    const result = await client(`
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        COUNT(c.comment_id) as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.post_id = c.post_id
      WHERE p.user_id = $1
      GROUP BY p.post_id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    return result.rows;
  }

  // Get user's comments
  static async getUserComments(userId, limit = 10, offset = 0) {
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

  // Check if username exists
  static async checkUsername(username, excludeUserId = null) {
    let query_string = 'SELECT user_id FROM users WHERE username = $1';
    let params = [username];

    if (excludeUserId) {
      query_string += ' AND user_id != $2';
      params.push(excludeUserId);
    }

    const result = await client(query_string, params);
    return result.rows.length > 0;
  }

  // Check if email exists
  static async checkEmail(email, excludeUserId = null) {
    let query_string = 'SELECT user_id FROM users WHERE email = $1';
    let params = [email];

    if (excludeUserId) {
      query_string += ' AND user_id != $2';
      params.push(excludeUserId);
    }

    const result = await client(query_string, params);
    return result.rows.length > 0;
  }
}