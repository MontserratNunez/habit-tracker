import { sendTokenResponse } from '../utils/generateToken.js';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await authService.loginUser(validatedData.email, validatedData.password);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};