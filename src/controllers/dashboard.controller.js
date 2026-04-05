import * as dashboardService from '../services/dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();

  res.status(200).json(
    new ApiResponse(200, { summary }, 'Dashboard summary fetched successfully.')
  );
});

export const getCategoryTotals = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const categories = await dashboardService.getCategoryTotals({ type });

  res.status(200).json(
    new ApiResponse(200, { categories }, 'Category totals fetched successfully.')
  );
});

export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const trends = await dashboardService.getMonthlyTrends({ year });

  res.status(200).json(
    new ApiResponse(200, { year: year || new Date().getFullYear(), trends }, 'Monthly trends fetched successfully.')
  );
});

export const getWeeklyTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getWeeklyTrends();

  res.status(200).json(
    new ApiResponse(200, { trends }, 'Weekly trends fetched successfully.')
  );
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const transactions = await dashboardService.getRecentActivity(limit);

  res.status(200).json(
    new ApiResponse(200, { transactions }, 'Recent activity fetched successfully.')
  );
});
