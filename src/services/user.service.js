import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

export const getAllUsers = async ({ page = 1, limit = 20, role, status }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};

export const createUser = async ({ name, email, password, role = 'viewer' }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email is already registered.');

  return User.create({ name, email, password, role });
};

export const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'email', 'role', 'status'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  const user = await User.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};

export const deleteUser = async (id, requesterId) => {
  if (id === requesterId) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found.');
};

export const toggleUserStatus = async (id, requesterId) => {
  if (id === requesterId) {
    throw new ApiError(400, 'You cannot change your own account status.');
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();
  return user;
};
