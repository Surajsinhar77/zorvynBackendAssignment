import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import ApiError from './utils/ApiError.js';

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found.`));
});

// Global error handler
app.use((err, req, res, next) => {
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new ApiError(401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    err = new ApiError(401, 'Token has expired. Please log in again.');
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    err = new ApiError(400, `Invalid ${err.path}: ${err.value}.`);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ApiError(409, `${field} already exists.`);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    err = new ApiError(422, 'Validation failed.', errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(err.errors?.length > 0 && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
});

export default app;
