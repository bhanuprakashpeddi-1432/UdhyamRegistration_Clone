import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { APIResponse } from '@/types';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });

    const response: APIResponse = {
      success: false,
      message: 'Validation failed',
      errors
    };
    
    res.status(400).json(response);
    return;
  }

  // Default error response
  const response: APIResponse = {
    success: false,
    message: 'Internal server error'
  };

  res.status(500).json(response);
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: APIResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`
  };
  
  res.status(404).json(response);
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
}
