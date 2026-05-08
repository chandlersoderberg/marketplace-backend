/**
 * Global error handler middleware.
 * Captures all errors thrown in routes and returns a standard JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // If the error status code is not set or is 200, default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode for security reasons
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
