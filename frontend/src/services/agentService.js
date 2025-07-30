import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

const agentService = {
  // Get all agents
  getAllAgents: async () => {
    const response = await api.get('/agents');
    return response;
  },

  // Get agent by ID
  getAgentById: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response;
  },

  // Create new agent
  createAgent: async (agentData) => {
    const response = await api.post('/agents', agentData);
    return response;
  },

  // Update agent
  updateAgent: async (id, agentData) => {
    const response = await api.put(`/agents/${id}`, agentData);
    return response;
  },

  // Delete agent
  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response;
  }
};

export default agentService;
