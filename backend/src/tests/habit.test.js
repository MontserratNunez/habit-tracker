import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../services/habit.service.js', () => ({
  getUserHabits: jest.fn(),
  createNewHabit: jest.fn(),
  toggleHabitStatusService: jest.fn(),
  deleteHabitService: jest.fn(),
  checkInHabit: jest.fn(),
  getTodayHabitsService: jest.fn(),
  getWeeklyHabitsService: jest.fn(),
  getMonthlyHabitsService: jest.fn(),
}));

jest.unstable_mockModule('../middlewares/auth.middleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'mocked_user_id_123' };
    next();
  },
}));

const habitService = await import('../services/habit.service.js');
const habitRoutes = (await import('../routes/habit.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/habits', habitRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

describe('Habit Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/habits/stats/today', () => {
    it('debe retornar hábitos del día con status 200', async () => {
      const mockResult = {
        period: 'today',
        summary: { totalDue: 2, completedCount: 1, pendingCount: 1 },
        data: { completed: [], pending: [] },
      };
      habitService.getTodayHabitsService.mockResolvedValue(mockResult);

      const res = await request(app).get('/api/habits/stats/today');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.period).toBe('today');
      expect(habitService.getTodayHabitsService).toHaveBeenCalledWith('mocked_user_id_123');
    });
  });

  describe('GET /api/habits/stats/week', () => {
    it('debe retornar hábitos de la semana con status 200', async () => {
      const mockResult = {
        period: 'this_week',
        summary: { totalActive: 3, completedCount: 2, pendingCount: 1 },
        data: { completed: [], pending: [] },
      };
      habitService.getWeeklyHabitsService.mockResolvedValue(mockResult);

      const res = await request(app).get('/api/habits/stats/week');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.period).toBe('this_week');
      expect(habitService.getWeeklyHabitsService).toHaveBeenCalledWith('mocked_user_id_123');
    });
  });

  describe('GET /api/habits/stats/month', () => {
    it('debe retornar hábitos del mes con status 200', async () => {
      const mockResult = {
        period: 'this_month',
        summary: { totalActive: 3, completedCount: 3, pendingCount: 0 },
        data: { completed: [], pending: [] },
      };
      habitService.getMonthlyHabitsService.mockResolvedValue(mockResult);

      const res = await request(app).get('/api/habits/stats/month');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.period).toBe('this_month');
      expect(habitService.getMonthlyHabitsService).toHaveBeenCalledWith('mocked_user_id_123');
    });
  });

  describe('GET /api/habits', () => {
    it('debe obtener la lista de hábitos del usuario', async () => {
      const mockHabits = [
        { _id: '1', title: 'Meditar', status: true },
        { _id: '2', title: 'Leer', status: true },
      ];
      habitService.getUserHabits.mockResolvedValue(mockHabits);

      const res = await request(app).get('/api/habits?status=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(mockHabits);
      expect(habitService.getUserHabits).toHaveBeenCalledWith('mocked_user_id_123', 'true');
    });
  });

  describe('POST /api/habits', () => {
    it('debe crear un hábito con un objeto de frecuencia válido', async () => {
      const payload = {
        title: 'Hacer ejercicio',
        frequency: { type: 'daily' },
      };
      const createdHabit = { _id: 'habit_123', ...payload, user: 'mocked_user_id_123' };
      habitService.createNewHabit.mockResolvedValue(createdHabit);

      const res = await request(app).post('/api/habits').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdHabit);
      expect(habitService.createNewHabit).toHaveBeenCalledWith(
        { title: 'Hacer ejercicio', frequency: { type: 'daily' } },
        'mocked_user_id_123'
      );
    });

    it('debe preprocesar la frecuencia cuando se envía como string corto', async () => {
      const payload = { title: 'Beber Agua', frequency: 'daily' };
      const createdHabit = { _id: 'habit_124', title: 'Beber Agua', frequency: { type: 'daily' } };
      habitService.createNewHabit.mockResolvedValue(createdHabit);

      const res = await request(app).post('/api/habits').send(payload);

      expect(res.status).toBe(201);
      expect(habitService.createNewHabit).toHaveBeenCalledWith(
        { title: 'Beber Agua', frequency: { type: 'daily' } },
        'mocked_user_id_123'
      );
    });

    it('debe fallar la validación Zod si no se envía el título', async () => {
      const payload = { frequency: 'daily' };

      const res = await request(app).post('/api/habits').send(payload);

      expect(res.status).toBe(500);
      expect(habitService.createNewHabit).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/habits/:id', () => {
    it('debe eliminar un hábito exitosamente', async () => {
      habitService.deleteHabitService.mockResolvedValue({ _id: 'habit_123' });

      const res = await request(app).delete('/api/habits/habit_123');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Hábito eliminado exitosamente');
      expect(habitService.deleteHabitService).toHaveBeenCalledWith('habit_123', 'mocked_user_id_123');
    });
  });

  describe('PATCH /api/habits/:id/toggle-status', () => {
    it('debe cambiar el estado del hábito', async () => {
      const updatedHabit = { _id: 'habit_123', status: false };
      habitService.toggleHabitStatusService.mockResolvedValue(updatedHabit);

      const res = await request(app).patch('/api/habits/habit_123/toggle-status');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(false);
      expect(habitService.toggleHabitStatusService).toHaveBeenCalledWith('habit_123', 'mocked_user_id_123');
    });
  });

  describe('PUT /api/habits/:id/checkin', () => {
    it('debe realizar el check-in diario de un hábito', async () => {
      const updatedHabit = { _id: 'habit_123', currentStreak: 1, lastCompleted: new Date() };
      habitService.checkInHabit.mockResolvedValue(updatedHabit);

      const res = await request(app).put('/api/habits/habit_123/checkin');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(habitService.checkInHabit).toHaveBeenCalledWith('habit_123', 'mocked_user_id_123');
    });
  });
});