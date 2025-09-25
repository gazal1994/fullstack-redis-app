import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from './apiSlice';

interface UserState {
  currentUser: User | null;
  selectedUsers: User[];
  filters: {
    search: string;
    sortBy: 'name' | 'email' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  };
  ui: {
    isLoading: boolean;
    error: string | null;
    showCreateForm: boolean;
    showEditForm: boolean;
    editingUserId: string | null;
  };
}

const initialState: UserState = {
  currentUser: null,
  selectedUsers: [],
  filters: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  ui: {
    isLoading: false,
    error: null,
    showCreateForm: false,
    showEditForm: false,
    editingUserId: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // User management
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    
    selectUser: (state, action: PayloadAction<User>) => {
      const existingIndex = state.selectedUsers.findIndex(user => user._id === action.payload._id);
      if (existingIndex === -1) {
        state.selectedUsers.push(action.payload);
      }
    },
    
    deselectUser: (state, action: PayloadAction<string>) => {
      state.selectedUsers = state.selectedUsers.filter(user => user._id !== action.payload);
    },
    
    clearSelectedUsers: (state) => {
      state.selectedUsers = [];
    },
    
    // Filters
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<'name' | 'email' | 'createdAt'>) => {
      state.filters.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload;
    },
    
    toggleSortOrder: (state) => {
      state.filters.sortOrder = state.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    
    // UI state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.ui.error = action.payload;
    },
    
    showCreateForm: (state) => {
      state.ui.showCreateForm = true;
      state.ui.showEditForm = false;
      state.ui.editingUserId = null;
    },
    
    showEditForm: (state, action: PayloadAction<string>) => {
      state.ui.showEditForm = true;
      state.ui.showCreateForm = false;
      state.ui.editingUserId = action.payload;
    },
    
    hideForms: (state) => {
      state.ui.showCreateForm = false;
      state.ui.showEditForm = false;
      state.ui.editingUserId = null;
    },
    
    // Reset state
    resetUserState: () => initialState,
  },
});

export const {
  // User actions
  setCurrentUser,
  selectUser,
  deselectUser,
  clearSelectedUsers,
  
  // Filter actions
  setSearchFilter,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  
  // UI actions
  setLoading,
  setError,
  showCreateForm,
  showEditForm,
  hideForms,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;