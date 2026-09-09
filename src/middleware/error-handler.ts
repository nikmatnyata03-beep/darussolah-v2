/**
 * Global Error Handler Middleware
 * 
 * This module provides centralized error handling to prevent information leakage
 * and ensure consistent error responses across the application.
 */

import { Request, Response, NextFunction } from 'express';

// Custom error class for application-specific errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400);
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        type: err.constructor.name,
        field: (err as ValidationError).field || undefined,
      },
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        type: 'ValidationError',
      },
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Invalid token',
        type: 'AuthenticationError',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token expired',
        type: 'AuthenticationError',
      },
    });
  }

  // Handle database errors
  if (err.message.includes('duplicate key')) {
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        type: 'ConflictError',
      },
    });
  }

  if (err.message.includes('foreign key')) {
    return res.status(400).json({
      error: {
        message: 'Invalid reference to related resource',
        type: 'ValidationError',
      },
    });
  }

  // Default: Internal server error
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return res.status(500).json({
    error: {
      message: isProduction ? 'Internal server error' : err.message,
      type: 'InternalServerError',
    },
  });
};

// 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      type: 'NotFoundError',
    },
  });
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
