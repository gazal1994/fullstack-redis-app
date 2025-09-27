import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from './apiSlice';

// Task filtering and sorting options
export type TaskFilter = 'all' | 'completed' | 'pending';
export type TaskSortBy = 'createdAt' | 'title' | 'completed';
export type SortOrder = 'asc' | 'desc';

// UI state for task management
export interface TaskUIState {
  // Filtering and sorting
  filter: TaskFilter;
  sortBy: TaskSortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  
  // UI states
  isCreating: boolean;
  editingTaskId: string | null;
  selectedTaskIds: string[];
  showCompleted: boolean;
  
  // Bulk operations
  selectAll: boolean;
  bulkActionMode: boolean;
  
  // View preferences
  viewMode: 'list' | 'grid' | 'compact';
  itemsPerPage: number;
  currentPage: number;
  
  // Error and success messages
  lastAction: {
    type: 'create' | 'update' | 'delete' | 'bulk' | null;
    success: boolean;
    message: string;
    timestamp: number;
  } | null;
}

const initialState: TaskUIState = {
  // Filtering and sorting
  filter: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  searchQuery: '',
  
  // UI states
  isCreating: false,
  editingTaskId: null,
  selectedTaskIds: [],
  showCompleted: true,
  
  // Bulk operations
  selectAll: false,
  bulkActionMode: false,
  
  // View preferences
  viewMode: 'list',
  itemsPerPage: 10,
  currentPage: 1,
  
  // Messages
  lastAction: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    // Filtering and sorting actions
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    setSortBy: (state, action: PayloadAction<TaskSortBy>) => {
      if (state.sortBy === action.payload) {
        // Toggle sort order if same field
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.sortOrder = 'asc';
      }
    },
    
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    
    // UI state actions
    setIsCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    
    setEditingTaskId: (state, action: PayloadAction<string | null>) => {
      state.editingTaskId = action.payload;
    },
    
    toggleShowCompleted: (state) => {
      state.showCompleted = !state.showCompleted;
      state.currentPage = 1; // Reset pagination
    },
    
    setShowCompleted: (state, action: PayloadAction<boolean>) => {
      state.showCompleted = action.payload;
      state.currentPage = 1;
    },
    
    // Selection actions
    selectTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      if (!state.selectedTaskIds.includes(taskId)) {
        state.selectedTaskIds.push(taskId);
      }
    },
    
    deselectTask: (state, action: PayloadAction<string>) => {
      state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload);
    },
    
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      if (state.selectedTaskIds.includes(taskId)) {
        state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== taskId);
      } else {
        state.selectedTaskIds.push(taskId);
      }
    },
    
    selectAllTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = action.payload;
      state.selectAll = true;
    },
    
    clearSelection: (state) => {
      state.selectedTaskIds = [];
      state.selectAll = false;
      state.bulkActionMode = false;
    },
    
    toggleSelectAll: (state, action: PayloadAction<string[]>) => {
      if (state.selectAll) {
        state.selectedTaskIds = [];
        state.selectAll = false;
      } else {
        state.selectedTaskIds = action.payload;
        state.selectAll = true;
      }
    },
    
    // Bulk operations
    setBulkActionMode: (state, action: PayloadAction<boolean>) => {
      state.bulkActionMode = action.payload;
      if (!action.payload) {
        state.selectedTaskIds = [];
        state.selectAll = false;
      }
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'compact'>) => {
      state.viewMode = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Action feedback
    setLastAction: (state, action: PayloadAction<TaskUIState['lastAction']>) => {
      state.lastAction = action.payload;
    },
    
    clearLastAction: (state) => {
      state.lastAction = null;
    },
    
    // Reset all filters and UI state
    resetFilters: (state) => {
      state.filter = 'all';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
      state.searchQuery = '';
      state.currentPage = 1;
      state.showCompleted = true;
    },
    
    resetUIState: (state) => {
      state.isCreating = false;
      state.editingTaskId = null;
      state.selectedTaskIds = [];
      state.selectAll = false;
      state.bulkActionMode = false;
      state.currentPage = 1;
      state.lastAction = null;
    },
  },
});

// Action creators
export const {
  setFilter,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setIsCreating,
  setEditingTaskId,
  toggleShowCompleted,
  setShowCompleted,
  selectTask,
  deselectTask,
  toggleTaskSelection,
  selectAllTasks,
  clearSelection,
  toggleSelectAll,
  setBulkActionMode,
  setViewMode,
  setItemsPerPage,
  setCurrentPage,
  setLastAction,
  clearLastAction,
  resetFilters,
  resetUIState,
} = taskSlice.actions;

// Selectors
export const selectTaskFilter = (state: { task: TaskUIState }) => state.task.filter;
export const selectTaskSort = (state: { task: TaskUIState }) => ({
  sortBy: state.task.sortBy,
  sortOrder: state.task.sortOrder,
});
export const selectSearchQuery = (state: { task: TaskUIState }) => state.task.searchQuery;
export const selectSelectedTaskIds = (state: { task: TaskUIState }) => state.task.selectedTaskIds;
export const selectBulkActionMode = (state: { task: TaskUIState }) => state.task.bulkActionMode;
export const selectViewMode = (state: { task: TaskUIState }) => state.task.viewMode;
export const selectPagination = (state: { task: TaskUIState }) => ({
  currentPage: state.task.currentPage,
  itemsPerPage: state.task.itemsPerPage,
});
export const selectLastAction = (state: { task: TaskUIState }) => state.task.lastAction;
export const selectEditingTaskId = (state: { task: TaskUIState }) => state.task.editingTaskId;
export const selectShowCompleted = (state: { task: TaskUIState }) => state.task.showCompleted;

// Complex selectors for filtered and sorted tasks
export const selectFilteredTaskIds = (tasks: Task[]) => (state: { task: TaskUIState }) => {
  let filtered = tasks;
  
  // Apply filter
  if (state.task.filter !== 'all') {
    filtered = filtered.filter(task => 
      state.task.filter === 'completed' ? task.completed : !task.completed
    );
  }
  
  // Apply search
  if (state.task.searchQuery.trim()) {
    const query = state.task.searchQuery.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description?.toLowerCase().includes(query) ?? false)
    );
  }
  
  // Apply show completed filter
  if (!state.task.showCompleted) {
    filtered = filtered.filter(task => !task.completed);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (state.task.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'completed':
        comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
    }
    
    return state.task.sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return filtered.map(task => task.id);
};

export default taskSlice.reducer;