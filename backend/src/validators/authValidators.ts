import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters')
    .bail()
    .custom((value: string) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('Password must be 72 bytes or fewer'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 72 })
    .withMessage('Password is too long')
    .bail()
    .custom((value: string) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('Password is too long'),
];
