import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new ApiError(422, 'Validation failed.', errorMessages));
  }
  next();
};

export default validate;
