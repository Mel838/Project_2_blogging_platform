import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handling wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Global error handler
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    error: err.stack,
    userId: req.user?.user_id,
    ip: req.ip
  });

  // Handle specific database errors
  if (err.code === '23505') { // Unique violation
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  if (err.code === '23503') { // Foreign key violation
    error.message = 'Invalid reference to related data';
    error.statusCode = 400;
  }

  if (err.code === '23502') { // Not null violation
    error.message = 'Required field missing';
    error.statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired. Please log in again';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};