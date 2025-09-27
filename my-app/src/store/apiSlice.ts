import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define API response types
export interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  profile?: {
    bio?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

// Define the API slice - USERS ONLY
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Task'],
  endpoints: (builder) => ({
    // 1. GET USERS - Get all users
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    
    // 2. GET USER - Get single user by ID
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `users/${id}`,
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),
    
    // 3. ADD USER - Create new user
    createUser: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // 4. UPDATE USER - Update existing user
    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }, 'User'],
    }),
    
    // 5. DELETE USER - Delete user by ID
    deleteUser: builder.mutation<ApiResponse<{ id: string; name: string }>, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // ============================================================================
    // TASK ENDPOINTS
    // ============================================================================
    
    // 1. GET TASKS - Get all tasks with optional filtering
    getTasks: builder.query<ApiResponse<Task[]>, { completed?: boolean } | undefined>({
      query: (params = {}) => ({
        url: 'tasks',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    // 2. CREATE TASK - Create new task
    createTask: builder.mutation<ApiResponse<Task>, { title: string; description?: string }>({
      query: (taskData) => ({
        url: 'tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    // 3. UPDATE TASK - Update existing task
    updateTask: builder.mutation<ApiResponse<Task>, { id: string; data: Partial<Omit<Task, 'id'>> }>({
      query: ({ id, data }) => ({
        url: `tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Task', id }],
    }),

    // 4. DELETE TASK - Delete task by ID
    deleteTask: builder.mutation<ApiResponse<Task>, string>({
      query: (id) => ({
        url: `tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Task', id }],
    }),
  }),
});

// Export hooks for User and Task operations
export const {
  // User hooks
  useGetUsersQuery,        // Get all users
  useGetUserByIdQuery,     // Get single user
  useCreateUserMutation,   // Add/Create user
  useUpdateUserMutation,   // Update user
  useDeleteUserMutation,   // Delete user
  
  // Task hooks
  useGetTasksQuery,        // Get all tasks
  useCreateTaskMutation,   // Create new task
  useUpdateTaskMutation,   // Update task
  useDeleteTaskMutation,   // Delete task
} = apiSlice;