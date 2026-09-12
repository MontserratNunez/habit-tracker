import { z } from 'zod';
import * as habitService from '../services/habit.service.js';

const frequencyObjectSchema = z.object({
  type: z.enum([
    'daily',
    'weekly',
    'monthly',
    'weekly_target',
    'weekly_days',
    'interval_weeks',
    'monthly_days',
    'monthly_pattern',
  ]),
  targetCount: z.number().int().min(1).max(31).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  daysOfMonth: z.array(z.number().int().min(1).max(31)).optional(),
  intervalWeeks: z.number().int().min(1).optional(),
  monthlyPattern: z
    .object({
      weekNumber: z.number().int().min(1).max(5),
      dayOfWeek: z.number().int().min(0).max(6),
    })
    .optional(),
});

const frequencySchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return { type: val };
  }
  return val;
}, frequencyObjectSchema);

const habitCreateSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'El título es muy largo'),
  frequency: frequencySchema.default({ type: 'daily' }),
});

const historyQuerySchema = z.object({
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

export const getHabits = async (req, res, next) => {
  try {
    const habits = await habitService.getUserHabits(req.user.id, req.query.status);
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch (error) {
    next(error);
  }
};

export const getHabitById = async (req, res, next) => {
  try {
    const habit = await habitService.getHabitByIdService(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

export const createHabit = async (req, res, next) => {
  try {
    const validatedData = habitCreateSchema.parse(req.body);
    const habit = await habitService.createNewHabit(validatedData, req.user.id);

    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

export const toggleHabitStatus = async (req, res, next) => {
  try {
    const updatedHabit = await habitService.toggleHabitStatusService(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: updatedHabit });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    await habitService.deleteHabitService(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Hábito eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const completeHabit = async (req, res, next) => {
  try {
    const updatedHabit = await habitService.checkInHabit(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: updatedHabit });
  } catch (error) {
    next(error);
  }
};



// views

export const getTodayHabits = async (req, res, next) => {
  try {
    const result = await habitService.getTodayHabitsService(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyHabits = async (req, res, next) => {
  try {
    const result = await habitService.getWeeklyHabitsService(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyHabits = async (req, res, next) => {
  try {
    const result = await habitService.getMonthlyHabitsService(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getHabitsHistory = async (req, res, next) => {
  try {
    const { startDate, endDate } = historyQuerySchema.parse(req.query);

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    const result = await habitService.getHabitsHistoryService(req.user.id, start, end);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};