import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Details]:', err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: 'Error de validación de datos',
      errors: formattedErrors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Recurso no encontrado. Formato de ID inválido: ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `El valor ingresado para '${field}' ya está en uso.`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token no válido. Por favor inicie sesión de nuevo.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'El token ha expirado. Por favor inicie sesión de nuevo.',
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
};

export default errorHandler;