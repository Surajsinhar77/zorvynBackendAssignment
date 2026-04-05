import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdValidator,
  listTransactionValidator,
} from '../validators/transaction.validator.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

// All roles can read transactions
router.get(
  '/',
  authorize('viewer', 'analyst', 'admin'),
  listTransactionValidator,
  validate,
  transactionController.getTransactions
);

router.get(
  '/:id',
  authorize('viewer', 'analyst', 'admin'),
  transactionIdValidator,
  validate,
  transactionController.getTransactionById
);

// Only admins can create, update, or delete
router.post(
  '/',
  authorize('admin'),
  createTransactionValidator,
  validate,
  transactionController.createTransaction
);

router.put(
  '/:id',
  authorize('admin'),
  updateTransactionValidator,
  validate,
  transactionController.updateTransaction
);

router.delete(
  '/:id',
  authorize('admin'),
  transactionIdValidator,
  validate,
  transactionController.deleteTransaction
);

export default router;
