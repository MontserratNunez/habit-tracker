import User from '../models/user.js';
import AppError from '../utils/AppError.js';

export const registerUser = async (userData) => {
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    throw new AppError('El correo electrónico ya está registrado', 400);
  }

  return await User.create(userData);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  return user;
};