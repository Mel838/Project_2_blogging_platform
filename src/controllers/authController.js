import { AuthService } from '../services/authService.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  // Register new user
  static register = catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);

    // Set HTTP-only cookie for additional security (optional)
    res.cookie('jwt', result.token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  });

  // Login user
  static login = catchAsync(async (req, res) => {
    const result = await AuthService.login(req.body);

    // Set HTTP-only cookie
    res.cookie('jwt', result.token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  });

  // Get user profile
  static getProfile = catchAsync(async (req, res) => {
    const user = await AuthService.getProfile(req.user.user_id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  });

  // Logout user
  static logout = (req, res) => {
    res.cookie('jwt', 'logged-out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    logger.info(`User logged out: ${req.user?.username || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}