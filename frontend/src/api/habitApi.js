import API from './authApi';

export const getTodayHabits = async () => {
  const { data } = await API.get('/habits/stats/today');
  return data;
};

export const getWeeklyHabits = async () => {
  const { data } = await API.get('/habits/stats/week');
  return data;
};

export const getMonthlyHabits = async () => {
  const { data } = await API.get('/habits/stats/month');
  return data;
};

export const getHabitsHistory = async (startDate, endDate) => {
  const { data } = await API.get('/habits/stats/history', {
    params: { startDate, endDate },
  });
  return data;
};

export const createHabitRequest = async (habitData) => {
  const { data } = await API.post('/habits', habitData);
  return data;
};

export const checkInHabitRequest = async (id) => {
  const { data } = await API.put(`/habits/${id}/checkin`);
  return data;
};

export const toggleHabitStatusRequest = async (id) => {
  const { data } = await API.patch(`/habits/${id}/toggle-status`);
  return data;
};

export const deleteHabitRequest = async (id) => {
  const { data } = await API.delete(`/habits/${id}`);
  return data;
};

export const getAllHabits = async () => {
  const { data } = await API.get(`/habits`);
  return data;
};
