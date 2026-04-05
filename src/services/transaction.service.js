import Transaction from '../models/transaction.model.js';
import ApiError from '../utils/ApiError.js';

export const getTransactions = async ({
  page = 1,
  limit = 20,
  type,
  category,
  startDate,
  endDate,
  search,
}) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { notes: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1, createdAt: -1 }),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id).populate(
    'createdBy',
    'name email'
  );
  if (!transaction) throw new ApiError(404, 'Transaction not found.');
  return transaction;
};

export const createTransaction = async (data, userId) => {
  return Transaction.create({ ...data, createdBy: userId });
};

export const updateTransaction = async (id, updates) => {
  const allowedFields = ['amount', 'type', 'category', 'date', 'notes'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  const transaction = await Transaction.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email');

  if (!transaction) throw new ApiError(404, 'Transaction not found.');
  return transaction;
};

export const deleteTransaction = async (id) => {
  // Soft delete — preserve the record for audit purposes
  const transaction = await Transaction.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!transaction) throw new ApiError(404, 'Transaction not found.');
};
