import Transaction from '../models/transaction.model.js';

export const getSummary = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };

  for (const item of result) {
    if (item._id === 'income') {
      summary.totalIncome = item.total;
      summary.incomeCount = item.count;
    } else if (item._id === 'expense') {
      summary.totalExpenses = item.total;
      summary.expenseCount = item.count;
    }
  }

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  summary.totalTransactions = summary.incomeCount + summary.expenseCount;

  return summary;
};

export const getCategoryTotals = async ({ type } = {}) => {
  const matchStage = { isDeleted: false };
  if (type) matchStage.type = type;

  return Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
        categoryTotal: { $sum: '$total' },
      },
    },
    { $sort: { categoryTotal: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        breakdown: 1,
        categoryTotal: 1,
      },
    },
  ]);
};

export const getMonthlyTrends = async ({ year } = {}) => {
  const currentYear = year || new Date().getFullYear();

  return Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.month',
        entries: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        month: '$_id',
        entries: 1,
      },
    },
  ]);
};

export const getWeeklyTrends = async () => {
  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  return Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: fourWeeksAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: '$date' },
          year: { $isoWeekYear: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { week: '$_id.week', year: '$_id.year' },
        entries: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        _id: 0,
        week: '$_id.week',
        year: '$_id.year',
        entries: 1,
      },
    },
  ]);
};

export const getRecentActivity = async (limit = 10) => {
  return Transaction.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};
