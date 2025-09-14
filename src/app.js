import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import indexRouter from "./routes/index.js";
import authRoutes from "./routes/authroute.js";
import userRoutes from "./routes/users.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./middleware/errorHandler.js";

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Global middleware
app.use(morgan('combined'));
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:4000", "frontendapp.vercel.app"],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;