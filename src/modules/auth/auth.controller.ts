import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { RegisterInput, LoginInput, UpdateProfileInput } from './auth.schema.js';

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

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: UpdateProfileInput = req.body;
      const user = await authService.updateProfile(userId, data);
      sendSuccess(res, user, 'Perfil actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const file = req.file;
      
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      const currentUser = await authService.getProfile(userId);
      
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');
        const oldAvatarPath = join(process.cwd(), currentUser.avatar);
        try {
          await unlink(oldAvatarPath);
        } catch (error) {
          console.error('Error al eliminar avatar anterior:', error);
        }
      }

      const avatarUrl = `/uploads/avatars/${file.filename}`;
      const user = await authService.updateProfile(userId, { avatar: avatarUrl });
      sendSuccess(res, user, 'Avatar actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deleteAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const currentUser = await authService.getProfile(userId);
      
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');
        const avatarPath = join(process.cwd(), currentUser.avatar);
        try {
          await unlink(avatarPath);
        } catch (error) {
          console.error('Error al eliminar avatar:', error);
        }
      }

      const user = await authService.updateProfile(userId, { avatar: null });
      sendSuccess(res, user, 'Avatar eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

