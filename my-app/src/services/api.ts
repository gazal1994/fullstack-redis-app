import axios from 'axios';
import type { Task } from '../components/tasks/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

// Task API service
export const taskApi = {
  // GET /api/tasks - Get all tasks
  async getAllTasks(params?: { completed?: boolean }): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<Task[]>>('/tasks', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },

  // POST /api/tasks - Create new task
  async createTask(taskData: { title: string; description?: string }): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create task';
      throw new Error(errorMessage);
    }
  },

  // PUT /api/tasks/:id - Update task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    try {
      const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update task';
      throw new Error(errorMessage);
    }
  },

  // DELETE /api/tasks/:id - Delete task
  async deleteTask(id: string): Promise<Task> {
    try {
      const response = await api.delete<ApiResponse<Task>>(`/tasks/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete task';
      throw new Error(errorMessage);
    }
  },
};

// Default export
export default api;