import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  forgotPassword: (email) => api.post('/admin/forgot-password', { email }),
  resetPassword: (data) => api.post('/admin/reset-password', data),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/change-password', data),
};

// Tickets API
export const ticketsAPI = {
  getOpenTickets: () => api.get('/tickets/open'),
  respondToTicket: (data) => api.post('/tickets/respond', data),
};

export default api;