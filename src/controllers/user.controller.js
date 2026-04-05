import * as userService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, status } = req.query;
  const result = await userService.getAllUsers({ page, limit, role, status });

  res.status(200).json(
    new ApiResponse(200, result, 'Users fetched successfully.')
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User fetched successfully.')
  );
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await userService.createUser({ name, email, password, role });

  res.status(201).json(
    new ApiResponse(201, { user }, 'User created successfully.')
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User updated successfully.')
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(
    req.params.id,
    req.user._id.toString()
  );

  res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully.')
  );
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(
    req.params.id,
    req.user._id.toString()
  );

  res.status(200).json(
    new ApiResponse(200, { user }, `User status changed to ${user.status}.`)
  );
});
