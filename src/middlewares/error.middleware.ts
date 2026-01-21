import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Error de validación', 400, formattedErrors);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    let errorMessage = 'Error de base de datos';
    
    if (err.code === 'P2002') {
      errorMessage = 'Ya existe un registro con estos datos';
    } else if (err.code === 'P2003') {
      errorMessage = 'Referencia inválida en la base de datos';
    } else if (err.code === 'P2025') {
      errorMessage = 'Registro no encontrado';
    } else if (process.env.NODE_ENV !== 'production') {
      errorMessage = `Error de base de datos: ${err.message} (Código: ${err.code})`;
    }
    
    sendError(res, errorMessage, 400, process.env.NODE_ENV !== 'production' ? { code: err.code, meta: err.meta } : undefined);
    return;
  }

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

