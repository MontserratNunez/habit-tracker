import Habit from '../models/habit.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export const getUserHabits = async (userId) => {
  return await Habit.find({ user: userId }).sort({ createdAt: -1 });
};

export const createNewHabit = async (habitData, userId) => {
  return await Habit.create({
    ...habitData,
    user: userId,
  });
};

export const checkInHabit = async (habitId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new AppError('El ID del hábito no es válido', 400);
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new AppError('Hábito no encontrado', 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alreadyCompleted = habit.completedDates.some((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (alreadyCompleted) {
    throw new AppError('Este hábito ya fue completado hoy', 400);
  }

  const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;

  if (lastCompleted) {
    lastCompleted.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - lastCompleted) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      habit.currentStreak += 1;
    } else if (diffDays > 1) {
      habit.currentStreak = 1;
    }
  } else {
    habit.currentStreak = 1;
  }

  if (habit.currentStreak > habit.longestStreak) {
    habit.longestStreak = habit.currentStreak;
  }

  habit.lastCompleted = today;
  habit.completedDates.push(today);

  await habit.save();
  return habit;
};