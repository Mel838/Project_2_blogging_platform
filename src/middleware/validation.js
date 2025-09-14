import { AppError } from './errorHandler.js';

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

// Basic validation schemas
export const registerSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.username || data.username.length < 3) {
      errors.push({ message: 'Username must be at least 3 characters long' });
    }
    
    if (!data.email || !isValidEmail(data.email)) {
      errors.push({ message: 'Valid email is required' });
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push({ message: 'Password must be at least 6 characters long' });
    }
    
    return {
      error: errors.length > 0 ? { details: errors } : null
    };
  }
};

export const loginSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.email || !isValidEmail(data.email)) {
      errors.push({ message: 'Valid email is required' });
    }
    
    if (!data.password) {
      errors.push({ message: 'Password is required' });
    }
    
    return {
      error: errors.length > 0 ? { details: errors } : null
    };
  }
};

export const postSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push({ message: 'Title must be at least 3 characters long' });
    }
    
    if (!data.content || data.content.trim().length < 10) {
      errors.push({ message: 'Content must be at least 10 characters long' });
    }
    
    return {
      error: errors.length > 0 ? { details: errors } : null
    };
  }
};

export const commentSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.content || data.content.trim().length < 1) {
      errors.push({ message: 'Comment content is required' });
    }
    
    if (data.content && data.content.length > 1000) {
      errors.push({ message: 'Comment content cannot exceed 1000 characters' });
    }
    
    return {
      error: errors.length > 0 ? { details: errors } : null
    };
  }
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Paging validation
export const validatePagination = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 100) {
    return next(new AppError('Limit cannot exceed 100', 400));
  }
  
  if (limit < 1 || offset < 0) {
    return next(new AppError('Invalid pagination parameters', 400));
  }
  
  req.pagination = { limit, offset };
  next();
};