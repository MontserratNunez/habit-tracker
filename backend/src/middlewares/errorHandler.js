import { ZodError } from 'zod';

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message || 'Server error.';
  let errors = null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error.';
    const issuesList = err.issues || err.errors || [];
    errors = issuesList.map((e) => e.message);
  }
  
  if (err.message === 'INVALID_ID') {
    statusCode = 400;
    message = 'The ID provided is not valid.';
  }

  if (err.message === 'NOT_FOUND') {
    statusCode = 404;
    message = 'Habit not found.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

export default errorHandler;