// Redux DevTools Configuration for Development
import { Task } from '../store/apiSlice';

// Helper function to log Redux actions in development
export const logReduxAction = (actionType: string, payload?: any) => {
  if (import.meta.env.DEV) {
    console.group(`🔄 Redux Action: ${actionType}`);
    console.log('Payload:', payload);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

// Helper to format RTK Query cache data for debugging
export const logCacheData = (endpoint: string, data: any) => {
  if (import.meta.env.DEV) {
    console.group(`📊 RTK Query Cache: ${endpoint}`);
    console.table(data);
    console.groupEnd();
  }
};

// Task formatting for easier debugging
export const formatTaskForLog = (task: Task) => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  createdAt: task.createdAt,
});

export const formatTasksForLog = (tasks: Task[]) =>
  tasks.map(formatTaskForLog);