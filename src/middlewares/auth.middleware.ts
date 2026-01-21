import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Token de acceso requerido', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 'Token inválido o expirado', 401);
  }
};

export const authorize = (...roles: ('DOCTOR' | 'PATIENT')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'No autenticado', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'No tienes permisos para realizar esta acción', 403);
      return;
    }

    next();
  };
};

