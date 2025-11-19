import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { getAuthToken } from '../utils/auth';
import { clearAllAuthData } from '../utils/clearAuthData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 API: 401 Unauthorized - clearing all auth data');
      clearAllAuthData();
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        console.log('🔀 Redirecting to login due to 401 error');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, organizationCode: string) => {
    const response = await api.post('/auth/register', { name, email, password, organizationCode });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (project: any) => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  updateProject: async (id: string, updates: any) => {
    const response = await api.put(`/projects/${id}`, updates);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  addMember: async (projectId: string, userId: string, role: string = 'member') => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
  },
  removeMember: async (projectId: string, userId: string) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (projectId?: string) => {
    const url = projectId ? `/tasks?project=${projectId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },
  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (task: any) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  updateTask: async (id: string, updates: any) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  updateTaskStatus: async (id: string, status: string) => {
    const response = await api.put(`/tasks/${id}/status`, { status });
    return response.data;
  },
  addComment: async (taskId: string, content: string) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  updateUser: async (id: string, updates: any) => {
    const response = await api.put(`/admin/users/${id}`, updates);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (updates: any) => {
    const response = await api.put('/users/profile', updates);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getProjects: async () => {
    const response = await api.get('/admin/projects');
    return response.data;
  },
  getTasks: async () => {
    const response = await api.get('/admin/tasks');
    return response.data;
  },
  updateUser: async (id: string, updates: any) => {
    const response = await api.put(`/admin/users/${id}`, updates);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete(`/admin/tasks/${id}`);
    return response.data;
  },
  getPendingUsers: async () => {
    const response = await api.get('/admin/users/pending');
    return response.data;
  },
  approveUser: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/approve`);
    return response.data;
  },
  rejectUser: async (id: string, reason?: string) => {
    const response = await api.post(`/admin/users/${id}/reject`, { reason });
    return response.data;
  },
  // Organization management
  getOrganizations: async () => {
    const response = await api.get('/admin/organizations');
    return response.data;
  },
  createOrganization: async (name: string, description?: string) => {
    const response = await api.post('/admin/organizations', { name, description });
    return response.data;
  },
  updateOrganization: async (id: string, updates: any) => {
    const response = await api.put(`/admin/organizations/${id}`, updates);
    return response.data;
  },
  deleteOrganization: async (id: string) => {
    const response = await api.delete(`/admin/organizations/${id}`);
    return response.data;
  },
  getOrgPendingUsers: async (code: string) => {
    const response = await api.get(`/admin/organizations/${code}/pending-users`);
    return response.data;
  },
};

export default api;
