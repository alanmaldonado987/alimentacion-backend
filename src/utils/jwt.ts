import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'DOCTOR' | 'PATIENT';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

