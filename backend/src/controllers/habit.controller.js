import { z } from 'zod';
import * as habitService from '../services/habit.service.js';

const habitSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'El título es muy largo'),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
});

export const getHabits = async (req, res, next) => {
  try {
    const habits = await habitService.getUserHabits(req.user.id);
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch (error) {
    next(error);
  }
};

export const createHabit = async (req, res, next) => {
  try {
    const validatedData = habitSchema.parse(req.body);
    const habit = await habitService.createNewHabit(validatedData, req.user.id);

    res.status(201).json({ success: true, data: habit });
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