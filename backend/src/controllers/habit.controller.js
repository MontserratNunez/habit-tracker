import { z } from 'zod';
import * as habitService from '../services/habit.service.js';

const habitSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'El título es muy largo'),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
});


export const getHabits = async (req, res) => {
  try {
    const habits = await habitService.getUserHabits(req.user.id);
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch {
    res.status(500).json({ success: false, error: 'Error del servidor al obtener hábitos' });
  }
};


export const createHabit = async (req, res) => {
  try {
    const validatedData = habitSchema.parse(req.body);
    const habit = await habitService.createNewHabit(validatedData, req.user.id);

    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, error: 'Error del servidor al crear el hábito' });
  }
};


export const completeHabit = async (req, res) => {
  try {
    const updatedHabit = await habitService.checkInHabit(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: updatedHabit });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Error del servidor al procesar el check-in' });
  }
};