import bcrypt from 'bcryptjs';
import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  // Register a new user
  static async register(userData) {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await client(
      'SELECT user_id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email or username already exists', 400);
    }

    // Hash password with cost factor of 12 for security
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user into database
    const result = await client(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    
    // Generate JWT token
    const token = generateToken(user.user_id);

    logger.info(`User registered successfully: ${username}`);

    return {
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    };
  }

  // Login user
  static async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const result = await client(
      'SELECT user_id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    logger.info(`User logged in successfully: ${user.username}`);

    return {
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email
      },
      token
    };
  }

  // Get user profile
  static async getProfile(userId) {
    const result = await client(
      'SELECT user_id, username, email, profile_picture, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }
}