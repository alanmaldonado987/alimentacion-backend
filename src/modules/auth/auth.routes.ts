import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register.bind(authController));
router.post('/login', validateBody(loginSchema), authController.login.bind(authController));
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;

