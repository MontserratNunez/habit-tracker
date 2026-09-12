import Habit from '../models/habit.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

// ==========================================
// Enpoints
// ==========================================

export const isHabitDueToday = (habit, date = new Date()) => {
  if (!habit || !habit.status) return false;

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const freq = habit.frequency || { type: 'daily' };

  switch (freq.type) {
    case 'daily':
      return true;

    case 'weekly': {
      const completionsThisWeek = getCompletionsInCurrentWeek(habit.completedDates, targetDate);
      return completionsThisWeek < 1;
    }

    case 'monthly': {
      const completionsThisMonth = getCompletionsInCurrentMonth(habit.completedDates, targetDate);
      return completionsThisMonth < 1;
    }

    case 'weekly_target': {
      const target = freq.targetCount || 1;
      const completionsThisWeek = getCompletionsInCurrentWeek(habit.completedDates, targetDate);
      return completionsThisWeek < target;
    }

    case 'weekly_days': {
      const currentDayOfWeek = targetDate.getDay();
      return Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.includes(currentDayOfWeek);
    }

    case 'interval_weeks': {
      const interval = freq.intervalWeeks || 1;
      const startDate = new Date(habit.createdAt || targetDate);
      
      const startWeek = getStartOfWeek(startDate);
      const currentWeek = getStartOfWeek(targetDate);

      const diffMs = currentWeek.getTime() - startWeek.getTime();
      const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

      return diffWeeks >= 0 && diffWeeks % interval === 0;
    }

    case 'monthly_days': {
      const currentDayOfMonth = targetDate.getDate();
      return Array.isArray(freq.daysOfMonth) && freq.daysOfMonth.includes(currentDayOfMonth);
    }

    case 'monthly_pattern': {
      if (!freq.monthlyPattern) return false;
      const { weekNumber, dayOfWeek } = freq.monthlyPattern;

      if (targetDate.getDay() !== dayOfWeek) return false;

      const dayOfMonth = targetDate.getDate();
      const currentOccurrence = Math.ceil(dayOfMonth / 7);

      return currentOccurrence === weekNumber;
    }

    default:
      return true;
  }
};

export const getUserHabits = async (userId, statusQuery) => {
  const query = { user: userId };

  if (statusQuery === 'true' || statusQuery === 'active') {
    query.status = true;
  } else if (statusQuery === 'false' || statusQuery === 'inactive') {
    query.status = false;
  }

  return await Habit.find(query).sort({ status: -1, createdAt: -1 });
};

export const createNewHabit = async (habitData, userId) => {
  return await Habit.create({
    ...habitData,
    user: userId,
  });
};

export const toggleHabitStatusService = async (habitId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new AppError('El ID del hábito no es válido', 400);
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new AppError('Hábito no encontrado', 404);
  }

  habit.status = !habit.status;
  await habit.save();

  return habit;
};

export const deleteHabitService = async (habitId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new AppError('El ID del hábito no es válido', 400);
  }

  const habit = await Habit.findOneAndDelete({ _id: habitId, user: userId });

  if (!habit) {
    throw new AppError('Hábito no encontrado', 404);
  }

  return habit;
};

export const checkInHabit = async (habitId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new AppError('El ID del hábito no es válido', 400);
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new AppError('Hábito no encontrado', 404);
  }

  if (!habit.status) {
    throw new AppError('No se puede marcar un hábito inactivo', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!isHabitDueToday(habit, today)) {
    throw new AppError('Este hábito no está programado para completarse hoy', 400);
  }

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

// ==========================================
// Diferent views
// ==========================================

export const getTodayHabitsService = async (userId) => {
  const habits = await Habit.find({ user: userId, status: true });
  const today = new Date();

  const dueHabits = habits.filter((habit) => isHabitDueToday(habit, today));

  const completed = [];
  const pending = [];

  dueHabits.forEach((habit) => {
    const isCompletedToday = habit.completedDates.some((date) => isSameDay(date, today));
    if (isCompletedToday) {
      completed.push(habit);
    } else {
      pending.push(habit);
    }
  });

  return {
    period: 'today',
    summary: {
      totalDue: dueHabits.length,
      completedCount: completed.length,
      pendingCount: pending.length,
    },
    data: { completed, pending },
  };
};

export const getWeeklyHabitsService = async (userId) => {
  const habits = await Habit.find({ user: userId, status: true });
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);

  const completed = [];
  const pending = [];

  habits.forEach((habit) => {
    const completionsThisWeek = habit.completedDates.filter((d) => {
      const date = new Date(d);
      return date >= startOfWeek && date <= endOfWeek;
    }).length;

    let targetRequired = 1;
    if (habit.frequency?.type === 'weekly_target') {
      targetRequired = habit.frequency.targetCount || 1;
    } else if (habit.frequency?.type === 'weekly_days' && Array.isArray(habit.frequency.daysOfWeek)) {
      targetRequired = habit.frequency.daysOfWeek.length;
    }

    if (completionsThisWeek >= targetRequired) {
      completed.push({ ...habit.toObject(), completionsThisWeek });
    } else {
      pending.push({ ...habit.toObject(), completionsThisWeek, targetRequired });
    }
  });

  return {
    period: 'this_week',
    summary: {
      totalActive: habits.length,
      completedCount: completed.length,
      pendingCount: pending.length,
    },
    data: { completed, pending },
  };
};

export const getMonthlyHabitsService = async (userId) => {
  const habits = await Habit.find({ user: userId, status: true });
  const today = new Date();
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  const completed = [];
  const pending = [];

  habits.forEach((habit) => {
    const completionsThisMonth = habit.completedDates.filter((d) => {
      const date = new Date(d);
      return date >= startOfMonth && date <= endOfMonth;
    }).length;

    let targetRequired = 1;
    if (habit.frequency?.type === 'monthly_days' && Array.isArray(habit.frequency.daysOfMonth)) {
      targetRequired = habit.frequency.daysOfMonth.length;
    }

    if (completionsThisMonth >= targetRequired) {
      completed.push({ ...habit.toObject(), completionsThisMonth });
    } else {
      pending.push({ ...habit.toObject(), completionsThisMonth, targetRequired });
    }
  });

  return {
    period: 'this_month',
    summary: {
      totalActive: habits.length,
      completedCount: completed.length,
      pendingCount: pending.length,
    },
    data: { completed, pending },
  };
};


// ==========================================
// utils
// ==========================================

const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getStartOfWeek = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getEndOfWeek = (d) => {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfMonth = (d) => {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

const getEndOfMonth = (d) => {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getCompletionsInCurrentWeek = (completedDates = [], targetDate) => {
  const startOfWeek = getStartOfWeek(targetDate);
  const endOfWeek = getEndOfWeek(targetDate);

  return completedDates.filter((dateStr) => {
    const d = new Date(dateStr);
    return d >= startOfWeek && d <= endOfWeek;
  }).length;
};

const getCompletionsInCurrentMonth = (completedDates = [], targetDate) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  return completedDates.filter((dateStr) => {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
};