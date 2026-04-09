import axios from 'axios';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeader();
  Object.assign(config.headers, headers);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const statsAPI = {
  getOverview: () => api.get('/statistics/overview'),
  getRevenueByCategory: () => api.get('/statistics/revenue-by-category'),
  getRevenueTrend: () => api.get('/statistics/revenue-trend'),
  getBookingsTrend: () => api.get('/statistics/bookings-trend'),
  getConfirmedTrend: () => api.get('/statistics/confirmed-trend'),
  getUsersTrend: () => api.get('/statistics/users-trend'),
};

export const configAPI = {
  getLogo: () => api.get('/config/logo'),
  uploadLogo: (formData) => api.post('/config/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/config'),
  update: (key, value) => api.put(`/config/${key}`, { value }),
};

export const galleryAPI = {
  getAll: () => api.get('/galleries'),
  upload: (formData) => api.post('/galleries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/galleries/${id}`, data),
  delete: (id) => api.delete(`/galleries/${id}`),
};

export const bookingsAPI = {
  getAll: (page = 0, size = 10, status = '', type = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    return api.get(`/bookings?${params.toString()}`);
  },
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
};

export const usersAPI = {
  getAll: (page = 0, size = 10, role = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (role) params.append('role', role);
    return api.get(`/users?${params.toString()}`);
  },
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export default api;