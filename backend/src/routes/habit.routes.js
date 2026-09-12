import { Router } from 'express';
import {
  getHabits,
  createHabit,
  completeHabit,
  toggleHabitStatus,
  deleteHabit,
  getTodayHabits,
  getWeeklyHabits,
  getMonthlyHabits,
} from '../controllers/habit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/stats/today', getTodayHabits);
router.get('/stats/week', getWeeklyHabits);
router.get('/stats/month', getMonthlyHabits);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .delete(deleteHabit);

router.patch('/:id/toggle-status', toggleHabitStatus);
router.put('/:id/checkin', completeHabit);

export default router;