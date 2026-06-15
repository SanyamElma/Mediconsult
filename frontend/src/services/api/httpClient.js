// Axios instance with JWT injection and refresh-token retry. Used when config.USE_MOCK is false.
import axios from 'axios';
import { config } from '../../config';

export const http = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach access token to every request.
http.interceptors.request.use((req) => {
  const token = localStorage.getItem(config.TOKEN_KEY);
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Refresh-token retry on 401.
let isRefreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return http(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem(config.REFRESH_KEY);
        const { data } = await axios.post(`${config.API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem(config.TOKEN_KEY, data.accessToken);
        flushQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return http(original);
      } catch (err) {
        flushQueue(err, null);
        localStorage.removeItem(config.TOKEN_KEY);
        localStorage.removeItem(config.REFRESH_KEY);
        localStorage.removeItem(config.USER_KEY);
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
