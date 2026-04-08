import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_FRONTEND_URL || process.env.REACT_APP_API_URL,
  withCredentials: true,
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Only log in development to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    // Only log in development to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
    }
    return response;
  },
  (error) => {
    // Only log in development to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Prevent infinite loops - only redirect on 401 for auth endpoints and not already on login page
    if (
      error.response?.status === 401 && 
      !window.location.pathname.includes('/login') &&
      (error.config?.url?.includes('/auth/') || error.config?.url?.includes('/profile/') || error.config?.url?.includes('/user/'))
    ) {
      // Clear any stored user data
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
