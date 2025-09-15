import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { client } from '../utils/database.js';
import { catchAsync } from './errorHandler.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify JWT token middleware (renamed from authenticate to protect)
export const protect = catchAsync(async (req, res, next) => {
  // 1) Get token from header or cookie
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

  // 3) Check if user still exists
  const result = await client(
    'SELECT user_id, username, email FROM users WHERE user_id = $1',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Grant access to protected route
  req.user = result.rows[0];
  next();
});

// Authorization middleware - check if user owns the resource
export const authorize = (resourceType) => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params.id;
    let query_string;
    
    switch (resourceType) {
      case 'post':
        query_string = 'SELECT user_id FROM posts WHERE post_id = $1';
        break;
      case 'comment':
        query_string = 'SELECT user_id FROM comments WHERE comment_id = $1';
        break;
      default:
        return next(new AppError('Invalid resource type', 400));
    }

    const result = await client(query_string, [resourceId]);
    
    if (result.rows.length === 0) {
      return next(new AppError(`${resourceType} not found`, 404));
    }

    if (result.rows[0].user_id !== req.user.user_id) {
      return next(new AppError(`You don't have permission to access this ${resourceType}`, 403));
    }

    next();
  });
};