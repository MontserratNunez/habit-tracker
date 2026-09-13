import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const loginRequest = async (credentials) => {
  const { data } = await API.post('/auth/login', credentials);
  return data;
};

export const signupRequest = async (userData) => {
  const { data } = await API.post('/auth/register', userData);
  return data;
};

export const logoutRequest = async () => {
  const { data } = await API.post('/auth/logout');
  return data;
};

export const getMeRequest = async () => {
  const { data } = await API.get('/auth/me');
  return data;
};

export default API;