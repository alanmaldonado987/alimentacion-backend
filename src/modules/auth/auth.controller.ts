import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const result = await authService.register(data);
      sendSuccess(res, result, 'Registro exitoso', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);
      sendSuccess(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, 'Tokens actualizados');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Sesión cerrada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

