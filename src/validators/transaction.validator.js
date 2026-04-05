import { body, param, query } from 'express-validator';
import { CATEGORIES } from '../models/transaction.model.js';

export const createTransactionValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const updateTransactionValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const transactionIdValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
];

export const listTransactionValidator = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type filter must be income or expense'),

  query('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
