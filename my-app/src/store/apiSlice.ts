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

export interface ApiResponse<T> {
  message: string;
  data?: T;
  count?: number;
  timestamp: string;
}

// Define the API slice - USERS ONLY
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],
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
  }),
});

// Export hooks for the 5 user operations ONLY
export const {
  useGetUsersQuery,        // Get all users
  useGetUserByIdQuery,     // Get single user
  useCreateUserMutation,   // Add/Create user
  useUpdateUserMutation,   // Update user
  useDeleteUserMutation,   // Delete user
} = apiSlice;