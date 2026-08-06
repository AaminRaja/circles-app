import api from './client';

export const getCommentsByPost = (postId, page = 1, limit = 20) =>
  api
    .get(`/comments/post/${postId}?page=${page}&limit=${limit}`)
    .then((res) => res.data);

export const createComment = (postId, body) =>
  api.post('/comments', { postId, body }).then((res) => res.data);

export const deleteComment = (id) => api.delete(`/comments/${id}`).then((res) => res.data);
