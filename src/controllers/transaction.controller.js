import * as transactionService from '../services/transaction.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, type, category, startDate, endDate, search } = req.query;
  const result = await transactionService.getTransactions({
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    search,
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Transactions fetched successfully.')
  );
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { transaction }, 'Transaction fetched successfully.')
  );
});

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(
    req.body,
    req.user._id
  );

  res.status(201).json(
    new ApiResponse(201, { transaction }, 'Transaction created successfully.')
  );
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, { transaction }, 'Transaction updated successfully.')
  );
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Transaction deleted successfully.')
  );
});
