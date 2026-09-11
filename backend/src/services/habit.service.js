import Habit from '../models/Habit.js';

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
  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    const error = new Error('Hábito no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alreadyCompleted = habit.completedDates.some((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (alreadyCompleted) {
    const error = new Error('Este hábito ya fue completado hoy');
    error.statusCode = 400;
    throw error;
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