import { Router } from 'express';
import { getHabits, createHabit, completeHabit } from '../controllers/habit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.put('/:id/checkin', completeHabit);

export default router;