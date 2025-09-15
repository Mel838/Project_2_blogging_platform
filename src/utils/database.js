import pkg from 'pg';
import { config } from '../config/env.js';
import { logger } from './logger.js';

const { Pool } = pkg;

// Create database connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database client function for executing queries
export const client = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    logger.info('Starting blog database initialization...');

    // Create users table
    await client(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table 
    await client(`
      CREATE TABLE IF NOT EXISTS posts (
        post_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create comments table
    await client(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Blog database tables created successfully');
  } catch (error) {
    logger.error('Blog database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Closing database...');
  pool.end();
});

export default pool;