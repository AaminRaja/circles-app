import api from './client';

export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password }).then((res) => res.data);

export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password }).then((res) => res.data);

export const logoutUser = () => api.post('/auth/logout').then((res) => res.data);

export const refreshSession = () => api.post('/auth/refresh').then((res) => res.data);

export const getCurrentUser = () => api.get('/auth/me').then((res) => res.data.user);
