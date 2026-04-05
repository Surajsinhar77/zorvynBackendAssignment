import { body, param } from 'express-validator';

export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
];

export const userIdValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];
