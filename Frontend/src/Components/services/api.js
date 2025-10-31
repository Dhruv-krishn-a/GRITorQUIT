// Frontend/src/Components/services/api.js
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.message === 'Network Error') {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          throw new Error(data.message || 'Session expired. Please login again.');
        
        case 403:
          throw new Error(data.message || 'You do not have permission to perform this action.');
        
        case 404:
          throw new Error(data.message || 'Resource not found.');
        
        case 422:
          const validationErrors = data.errors || data.details || [data.message];
          throw new Error(Array.isArray(validationErrors) ? validationErrors.join(', ') : validationErrors);
        
        case 500:
          throw new Error(data.message || 'Internal server error. Please try again later.');
        
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    }

    throw new Error(error.message || 'An unexpected error occurred.');
  }
);

// Enhanced API methods with better error handling
const withRetry = (apiCall, maxRetries = 2) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry on 4xx errors (except 429)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };
};

export const plansAPI = {
  // Basic CRUD operations
  getAll: () => withRetry(() => api.get('/plans'))(),
  getById: (id) => withRetry(() => api.get(`/plans/${id}`))(),
  create: (planData) => withRetry(() => api.post('/plans', planData))(),
  update: (id, planData) => withRetry(() => api.put(`/plans/${id}`, planData))(),
  delete: (id) => withRetry(() => api.delete(`/plans/${id}`))(),
  
  // Task operations
  updateTask: (planId, taskId, taskData) => 
    withRetry(() => api.put(`/plans/${planId}/tasks/${taskId}`, taskData))(),
  
  updateSubtask: (planId, taskId, subtaskId, subtaskData) => 
    withRetry(() => api.put(`/plans/${planId}/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData))(),
  
  // Enhanced time tracking operations
  updateTaskTime: (planId, taskId, timeData) => 
    withRetry(() => api.put(`/plans/${planId}/tasks/${taskId}/time`, timeData))(),
  
  startTimer: (planId, taskId, timerData) =>
    withRetry(() => api.post(`/plans/${planId}/tasks/${taskId}/timer/start`, timerData))(),
  
  stopTimer: (planId, taskId) =>
    withRetry(() => api.post(`/plans/${planId}/tasks/${taskId}/timer/stop`))(),
};

export const uploadAPI = {
  importPlan: (formData) => 
    withRetry(() => api.post('/upload/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    }))(),
};



export const authAPI = {
  login: (credentials) => 
    withRetry(() => api.post('/auth/login', credentials))(),
  
  signup: (userData) => 
    withRetry(() => api.post('/auth/signup', userData))(),
  
  getMe: () => 
    withRetry(() => api.get('/user/me'))(),
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.resolve();
  },
};

// api.js - Enhanced analyticsAPI with fallbacks
export const analyticsAPI = {
  getTimeStatistics: async (period = 'week') => {
    try {
      return await withRetry(() => api.get('/analytics/time', { params: { period } }))();
    } catch (error) {
      console.warn('Analytics endpoint not available, using fallback data:', error.message);
      // Return fallback data structure
      return {
        timeStats: {
          today: "0m",
          week: "0m", 
          month: "0m",
          total: "0m"
        },
        pomodoroStats: {
          completed: 0,
          weekly: 0,
          daily: 0,
          monthly: 0
        }
      };
    }
  },
  
  getDashboardStats: async () => {
    try {
      return await withRetry(() => api.get('/analytics/dashboard'))();
    } catch (error) {
      console.warn('Dashboard stats endpoint not available');
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalTime: "0m",
        productivityScore: 0
      };
    }
  },

  getProductivityData: async (period = 'week') => {
    try {
      return await withRetry(() => api.get('/analytics/productivity', { params: { period } }))();
    } catch (error) {
      console.warn('Productivity endpoint not available');
      return {
        period,
        efficiency: 0,
        consistency: 0,
        focusTime: "0m"
      };
    }
  },

  delete: async (planId) => {
    const response = await fetch(`/api/plans/${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete plan');
    }
    
    return await response.json();
  },

  getPomodoroStats: async (period = 'week') => {
    try {
      return await withRetry(() => api.get('/analytics/pomodoro', { params: { period } }))();
    } catch (error) {
      console.warn('Pomodoro stats endpoint not available');
      return {
        completed: 0,
        weekly: 0,
        daily: 0,
        monthly: 0,
        avgPerSession: 0
      };
    }
  }
};

// Utility functions
export const apiUtils = {
  createCancelToken: () => axios.CancelToken.source(),
  isCancel: (error) => axios.isCancel(error),
  setAuthToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  clearAuthToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getAuthToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return {
      status: 'healthy',
      timestamp: response.timestamp,
      database: response.database
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  plans: plansAPI,
  upload: uploadAPI,
  auth: authAPI,
  analytics: analyticsAPI,
  utils: apiUtils,
  healthCheck,
};