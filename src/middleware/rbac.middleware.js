import ApiError from '../utils/ApiError.js';

/**
 * Role hierarchy: admin > analyst > viewer
 * Usage: authorize('admin', 'analyst') — allows those roles through
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
};
