import axios from 'axios';

const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.message === 'Network Error') {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
);

export const plansAPI = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (planData) => api.post('/plans', planData),
  update: (id, planData) => api.put(`/plans/${id}`, planData),
  delete: (id) => api.delete(`/plans/${id}`),
  updateTask: (planId, taskId, taskData) => 
    api.put(`/plans/${planId}/tasks/${taskId}`, taskData),
  updateSubtask: (planId, taskId, subtaskId, subtaskData) => 
    api.put(`/plans/${planId}/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData),
};

export const uploadAPI = {
  importPlan: (formData) => 
    api.post('/upload/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Longer timeout for file uploads
    }),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getMe: () => api.get('/user/me'),
};

export default {
  plans: plansAPI,
  upload: uploadAPI,
  auth: authAPI,
};