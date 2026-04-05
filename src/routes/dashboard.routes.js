import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// Recent activity: all roles can see
router.get(
  '/recent',
  authorize('viewer', 'analyst', 'admin'),
  dashboardController.getRecentActivity
);

// Summary, category totals, trends: analyst and admin only
router.get(
  '/summary',
  authorize('analyst', 'admin'),
  dashboardController.getSummary
);

router.get(
  '/categories',
  authorize('analyst', 'admin'),
  dashboardController.getCategoryTotals
);

router.get(
  '/trends/monthly',
  authorize('analyst', 'admin'),
  dashboardController.getMonthlyTrends
);

router.get(
  '/trends/weekly',
  authorize('analyst', 'admin'),
  dashboardController.getWeeklyTrends
);

export default router;
