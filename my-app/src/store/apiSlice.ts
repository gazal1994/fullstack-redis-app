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

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string | User;
  tags?: string[];
  category?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  count?: number;
  cached?: boolean;
  timestamp: string;
}

export interface CacheItem {
  key: string;
  value: any;
  ttl?: number;
}

export interface HealthStatus {
  status: 'OK' | 'Partial' | 'Error';
  timestamp: string;
  services: {
    server: string;
    mongodb: {
      status: string;
      connected: boolean;
    };
    redis: {
      status: string;
      connected: boolean;
    };
  };
}

// Define the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    // You can add headers, authentication, etc. here
    prepareHeaders: (headers) => {
      // Add any default headers
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Post', 'Cache', 'Health'],
  endpoints: (builder) => ({
    // Health check
    getHealth: builder.query<HealthStatus, void>({
      query: () => '../health',
      providesTags: ['Health'],
    }),

    // User endpoints
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `users/${id}`,
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),
    
    createUser: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }, 'User'],
    }),
    
    deleteUser: builder.mutation<ApiResponse<{ id: string; name: string }>, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Post endpoints
    getPosts: builder.query<ApiResponse<Post[]>, { category?: string; author?: string }>({
      query: (params) => ({
        url: 'posts',
        params,
      }),
      providesTags: ['Post'],
    }),
    
    createPost: builder.mutation<ApiResponse<Post>, Partial<Post>>({
      query: (postData) => ({
        url: 'posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
    }),

    // Redis/Cache endpoints
    getCacheStats: builder.query<ApiResponse<{ totalKeys: number; available: boolean }>, void>({
      query: () => 'cache',
      providesTags: ['Cache'],
    }),
    
    getCacheValue: builder.query<ApiResponse<{ key: string; value: any; ttl?: number }>, string>({
      query: (key) => `cache/${key}`,
      providesTags: (_, __, key) => [{ type: 'Cache', id: key }],
    }),
    
    setCacheValue: builder.mutation<ApiResponse<CacheItem>, CacheItem>({
      query: (cacheData) => ({
        url: 'cache',
        method: 'POST',
        body: cacheData,
      }),
      invalidatesTags: ['Cache'],
    }),
    
    deleteCacheValue: builder.mutation<ApiResponse<{ key: string }>, string>({
      query: (key) => ({
        url: `cache/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, key) => [{ type: 'Cache', id: key }, 'Cache'],
    }),

    // Redis management endpoints
    pingRedis: builder.query<ApiResponse<{ response: string }>, void>({
      query: () => 'redis/ping',
    }),
    
    getRedisKeys: builder.query<ApiResponse<{ keys: string[]; count: number; pattern: string }>, string | void>({
      query: (pattern = '*') => ({
        url: 'redis/keys',
        params: { pattern },
      }),
      providesTags: ['Cache'],
    }),
    
    flushRedis: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: 'redis/flush',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cache'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Health
  useGetHealthQuery,
  
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // Posts
  useGetPostsQuery,
  useCreatePostMutation,
  
  // Cache
  useGetCacheStatsQuery,
  useGetCacheValueQuery,
  useSetCacheValueMutation,
  useDeleteCacheValueMutation,
  
  // Redis
  usePingRedisQuery,
  useGetRedisKeysQuery,
  useFlushRedisMutation,
} = apiSlice;