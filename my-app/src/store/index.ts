import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import userSlice from "./userSlice";
// import cacheSlice from "./cacheSlice"; // Removed - not using Redis

export const store = configureStore({
  reducer: {
    // API slice for RTK Query
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Feature slices
    user: userSlice,
    // cache: cacheSlice, // Removed - simplified to MongoDB-only operations
  },
  // Adding the api middleware enables caching, invalidation, polling, and other features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
      },
    }).concat(apiSlice.middleware),
  // Enable Redux DevTools in development
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
