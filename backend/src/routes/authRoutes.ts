import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../utils/validation';
import { loginValidator, registerValidator } from '../validators/authValidators';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});

router.post('/register', authLimiter, registerValidator, validateRequest, asyncHandler(controller.register));
router.post('/login', authLimiter, loginValidator, validateRequest, asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

export default router;
