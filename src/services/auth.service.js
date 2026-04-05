import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered.');
  }

  // First registered user becomes admin, rest are viewers
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'viewer';

  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);

  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account has been deactivated.');
  }

  const token = signToken(user._id);

  // Exclude password from returned user
  user.password = undefined;
  return { user, token };
};
