import prisma from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  TokenPayload,
} from '../../utils/jwt.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../utils/errors.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import type { User } from '@prisma/client';

interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        phone: data.phone,
      },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Clean up old refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token inválido o expirado');
      }

      // Delete old token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      const tokenPayload: TokenPayload = {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: getRefreshTokenExpiry(),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Refresh token inválido');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();

