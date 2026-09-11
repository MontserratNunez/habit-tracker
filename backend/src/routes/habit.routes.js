import { Router } from 'express';
import { getHabits, createHabit, completeHabit } from '../controllers/habit.controller.js';

const router = Router();

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.put('/:id/checkin', completeHabit);

export default router;