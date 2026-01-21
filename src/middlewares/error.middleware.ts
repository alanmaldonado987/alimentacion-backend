import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Error de validación', 400, formattedErrors);
    return;
  }

  // Custom application errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'Error de base de datos', 400);
    return;
  }

  // Default error
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    500
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
};

