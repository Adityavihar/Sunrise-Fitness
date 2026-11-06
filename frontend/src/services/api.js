import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token if present in localStorage (critical fallback for Safari/iOS third-party cookie restrictions)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sunrise_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables to handle multiple simultaneous requests during a refresh cycle
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to manage auto-token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and this request wasn't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If the error occurred on login or refresh, don't retry
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to rotate tokens via refresh cookie or stored refresh token
        const storedRefreshToken = localStorage.getItem('sunrise_refresh_token');
        const refreshRes = await api.post('/auth/refresh', {
          refreshToken: storedRefreshToken
        });

        const newAccessToken = refreshRes.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('sunrise_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        isRefreshing = false;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        localStorage.removeItem('sunrise_access_token');
        localStorage.removeItem('sunrise_refresh_token');

        // Session expired, fire custom event to let AuthContext clean up user state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-session-expired'));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
