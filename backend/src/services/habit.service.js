import Habit from '../models/habit.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];


const parseLocalDate = (dateStr, isEndOfDay = false) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date(NaN);

  const [year, month, day] = parts;
  if (isEndOfDay) {
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

// ==========================================
// Endpoints CRUD
// ==========================================

export const getUserHabits = async (userId, statusQuery) => {
  const query = { user: userId };

  if (statusQuery === 'true' || statusQuery === 'active') {
    query.status = true;
  } else if (statusQuery === 'false' || statusQuery === 'inactive') {
    query.status = false;
  }

  return await Habit.find(query).sort({ status: -1, createdAt: -1 });
};

export const getHabitByIdService = async (habitId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new AppError('El ID del hábito no es válido', 400);
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new AppError('Hábito no encontrado', 404);
  }

  return habit;
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

// ==========================================
// Different views
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
  const today = new Date();

  const startOfWeek = getMondayOfWeek(today);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const habits = await Habit.find({
    user: userId,
    status: true,
    createdAt: { $lte: endOfWeek },
  });

  const days = generateCalendarDaysRange(habits, startOfWeek, endOfWeek);

  return {
    period: 'this_week',
    range: {
      startDate: formatDateKey(startOfWeek),
      endDate: formatDateKey(endOfWeek),
    },
    days,
  };
};

export const getMonthlyHabitsService = async (userId) => {
  const today = new Date();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const habits = await Habit.find({
    user: userId,
    status: true,
    createdAt: { $lte: endOfMonth },
  });

  const calendar = generateCalendarDaysRange(habits, startOfMonth, endOfMonth);

  return {
    period: 'this_month',
    range: {
      startDate: formatDateKey(startOfMonth),
      endDate: formatDateKey(endOfMonth),
    },
    monthName: today.toLocaleString('es-ES', { month: 'long' }),
    year: today.getFullYear(),
    calendar,
  };
};

export const getHabitsHistoryService = async (userId, startDateStr, endDateStr) => {
  const startDate = parseLocalDate(startDateStr, false);
  const endDate = parseLocalDate(endDateStr, true);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new AppError('Las fechas proporcionadas no son válidas', 400);
  }

  if (startDate > endDate) {
    throw new AppError('La fecha inicial no puede ser mayor a la fecha final', 400);
  }

  const habits = await Habit.find({
    user: userId,
    createdAt: { $lte: endDate },
  }).sort({ createdAt: -1 });

  const calendar = generateCalendarDaysRange(habits, startDate, endDate);

  return {
    period: {
      startDate: formatDateKey(startDate),
      endDate: formatDateKey(endDate),
    },
    summary: {
      totalHabits: habits.length,
      totalDays: calendar.length,
    },
    calendar,
  };
};

// ==========================================
// Utils
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

const formatDateKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

const getMondayOfWeek = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
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

const isHabitScheduledForDate = (habit, targetDate) => {
  const createdAt = new Date(habit.createdAt);
  createdAt.setHours(0, 0, 0, 0);

  const date = new Date(targetDate);
  date.setHours(0, 0, 0, 0);

  if (createdAt > date) return false;

  const freq = habit.frequency;
  if (!freq || !freq.type) return true;

  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  switch (freq.type) {
    case 'daily':
      return true;

    case 'weekly_days':
      if (Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.length > 0) {
        return freq.daysOfWeek.includes(dayOfWeek);
      }
      return true;

    case 'monthly_days':
      if (Array.isArray(freq.daysOfMonth) && freq.daysOfMonth.length > 0) {
        return freq.daysOfMonth.includes(dayOfMonth);
      }
      return true;

    case 'monthly_pattern': {
      if (!freq.monthlyPattern) return false;
      const { weekNumber, dayOfWeek: patternDay } = freq.monthlyPattern;

      if (dayOfWeek !== patternDay) return false;

      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstMondayOfMonth = getMondayOfWeek(firstDayOfMonth);

      const targetMonday = getMondayOfWeek(date);

      const diffInTime = targetMonday.getTime() - firstMondayOfMonth.getTime();
      const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
      const currentWeekNumber = Math.floor(diffInDays / 7) + 1;

      return currentWeekNumber === weekNumber;
    }

    case 'interval_weeks': {
      const interval = freq.intervalWeeks || 1;
      const createdMonday = getMondayOfWeek(createdAt);
      const targetMonday = getMondayOfWeek(date);

      const diffInTime = targetMonday.getTime() - createdMonday.getTime();
      const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);

      if (diffInWeeks < 0 || diffInWeeks % interval !== 0) return false;

      if (Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.length > 0) {
        return freq.daysOfWeek.includes(dayOfWeek);
      }
      return true;
    }

    case 'weekly':
    case 'weekly_target': {
      const isCompletedThisDate = habit.completedDates.some((d) => isSameDay(new Date(d), date));
      if (isCompletedThisDate) return true;

      const targetRequired = freq.targetCount || 1;
      const startOfWeek = getMondayOfWeek(date);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const completionsThisWeek = habit.completedDates.filter((d) => {
        const compDate = new Date(d);
        return compDate >= startOfWeek && compDate <= endOfWeek;
      }).length;

      if (completionsThisWeek >= targetRequired) return false;

      return true;
    }

    case 'monthly': {
      const isCompletedThisDate = habit.completedDates.some((d) => isSameDay(new Date(d), date));
      if (isCompletedThisDate) return true;

      const targetRequired = freq.targetCount || 1;
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const completionsThisMonth = habit.completedDates.filter((d) => {
        const compDate = new Date(d);
        return compDate >= startOfMonth && compDate <= endOfMonth;
      }).length;

      if (completionsThisMonth >= targetRequired) return false;

      return true;
    }

    default:
      return true;
  }
};

const getHabitStatusForDate = (habit, targetDate, today) => {
  const isCompleted = habit.completedDates.some((d) => isSameDay(new Date(d), targetDate));
  if (isCompleted) return 'completed';

  const date = new Date(targetDate);
  date.setHours(0, 0, 0, 0);

  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  if (date > currentDate) return 'upcoming';
  if (date.getTime() === currentDate.getTime()) return 'pending';
  return 'missed';
};

const generateCalendarDaysRange = (habits, startDate, endDate) => {
  const today = new Date();
  const daysArray = [];

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dayDate = new Date(current);
    const dayOfWeekIndex = dayDate.getDay();

    const dayData = {
      date: formatDateKey(dayDate),
      dayName: DAY_NAMES[dayOfWeekIndex],
      dayOfMonth: dayDate.getDate(),
      dayOfWeek: dayOfWeekIndex,
      summary: {
        totalScheduled: 0,
        completedCount: 0,
        pendingCount: 0,
        missedCount: 0,
        upcomingCount: 0,
      },
      habits: {
        completed: [],
        pending: [],
        missed: [],
        upcoming: [],
      },
    };

    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, dayDate)) {
        const status = getHabitStatusForDate(habit, dayDate, today);
        const habitSummary = {
          _id: habit._id,
          title: habit.title,
          frequency: habit.frequency,
          currentStreak: habit.currentStreak,
          status: habit.status,
        };

        dayData.habits[status].push(habitSummary);
        dayData.summary.totalScheduled++;
        dayData.summary[`${status}Count`]++;
      }
    });

    daysArray.push(dayData);
    current.setDate(current.getDate() + 1);
  }

  return daysArray;
};