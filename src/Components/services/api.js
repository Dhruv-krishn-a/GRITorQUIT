// src/components/services/api.js
const API_BASE = 'http://localhost:5000/api';

async function request(path, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Prepare headers (don't overwrite when body is FormData)
  const headers = Object.assign({}, opts.headers || {});
  if (!(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    // create a helpful error object
    const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const plansAPI = {
  getAll: () => request('/plans'),
  getById: (id) => request(`/plans/${id}`),
  create: (planData) =>
    request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    }),
  update: (id, planData) =>
    request(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    }),
  delete: (id) =>
    request(`/plans/${id}`, {
      method: 'DELETE',
    }),
  updateTask: (planId, taskId, taskData) =>
    request(`/plans/${planId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
  updateSubtask: (planId, taskId, subtaskId, subtaskData) =>
    request(`/plans/${planId}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(subtaskData),
    }),
};

export const uploadAPI = {
  importPlan: (formData) =>
    // FormData - request helper will not set Content-Type automatically
    request('/upload/import', {
      method: 'POST',
      body: formData,
      // don't set 'Content-Type' here, browser will set boundary
    }),
};
