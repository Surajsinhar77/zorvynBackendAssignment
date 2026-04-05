import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
} from '../validators/user.validator.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// All user management routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/', userController.getUsers);
router.post('/', createUserValidator, validate, userController.createUser);
router.get('/:id', userIdValidator, validate, userController.getUserById);
router.put('/:id', updateUserValidator, validate, userController.updateUser);
router.delete('/:id', userIdValidator, validate, userController.deleteUser);
router.patch('/:id/status', userIdValidator, validate, userController.toggleUserStatus);

export default router;
