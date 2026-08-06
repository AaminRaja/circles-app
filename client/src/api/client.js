import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  triggerAuthFailure,
} from "./tokenStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // required so the browser sends/receives the httpOnly refresh cookie
});

// Attach the current access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request comes back 401 (access token expired), try ONE silent refresh,
// then retry the original request with the new token. If the refresh itself
// fails, the refresh token is no longer valid — treat the user as logged out.
let isRefreshing = false;
let pendingRequests = [];

function resolvePendingRequests(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the failing request WAS the refresh call itself -- later added two requests
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // A refresh is already in flight — queue this request until it resolves
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.accessToken);
      resolvePendingRequests(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      setAccessToken(null);
      triggerAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
