import api from './client';

export const getPostsByCommunity = (communityId, page = 1, limit = 10) =>
  api
    .get(`/posts/community/${communityId}?page=${page}&limit=${limit}`)
    .then((res) => res.data);

export const getPost = (id) => api.get(`/posts/${id}`).then((res) => res.data);

export const createPost = (formData) =>
  api
    .post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);

export const toggleLikePost = (id) => api.post(`/posts/${id}/like`).then((res) => res.data);
