import api from './client';

export const getCommunities = (page = 1, limit = 12) =>
  api.get(`/communities?page=${page}&limit=${limit}`).then((res) => res.data);

export const getCommunity = (id) => api.get(`/communities/${id}`).then((res) => res.data);

export const createCommunity = (name, description) =>
  api.post('/communities', { name, description }).then((res) => res.data);

export const joinCommunity = (id) =>
  api.post(`/communities/${id}/join`).then((res) => res.data);
