import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for file uploads
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const uploadService = {
  // Upload and distribute CSV/Excel file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get all distributions
  getAllDistributions: async () => {
    const response = await api.get('/upload/distributions');
    return response;
  },

  // Get distributions for a specific agent
  getAgentDistributions: async (agentId) => {
    const response = await api.get(`/upload/distributions/${agentId}`);
    return response;
  },

  // Delete a distribution
  deleteDistribution: async (id) => {
    const response = await api.delete(`/upload/distributions/${id}`);
    return response;
  }
};

export default uploadService;
