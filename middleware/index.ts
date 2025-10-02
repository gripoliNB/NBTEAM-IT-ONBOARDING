import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiting
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// CORS middleware
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry found'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};


