import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  verifyToken: () => api.get('/auth/verify')
};

// Certificate API
export const certificateAPI = {
  upload: (formData, onUploadProgress) => {
    return api.post('/certificates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  verify: (formData) => {
    return api.post('/certificates/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  verifyByHash: (hash) => api.get(`/certificates/verify/${hash}`),

  getUserCertificates: () => api.get('/certificates'),

  getCertificateById: (id) => api.get(`/certificates/${id}`),

  getBlockchainStatus: () => api.get('/certificates/blockchain/status')
};

export default api;
