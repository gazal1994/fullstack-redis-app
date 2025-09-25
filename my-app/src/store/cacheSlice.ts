import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CacheEntry {
  key: string;
  value: any;
  ttl?: number;
  timestamp: string;
}

interface CacheState {
  entries: Record<string, CacheEntry>;
  stats: {
    totalKeys: number;
    available: boolean;
    lastUpdated: string | null;
  };
  filters: {
    search: string;
    pattern: string;
  };
  ui: {
    isLoading: boolean;
    error: string | null;
    showAddForm: boolean;
    selectedKeys: string[];
    viewMode: 'list' | 'json';
  };
}

const initialState: CacheState = {
  entries: {},
  stats: {
    totalKeys: 0,
    available: false,
    lastUpdated: null,
  },
  filters: {
    search: '',
    pattern: '*',
  },
  ui: {
    isLoading: false,
    error: null,
    showAddForm: false,
    selectedKeys: [],
    viewMode: 'list',
  },
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    // Cache entries management
    setCacheEntry: (state, action: PayloadAction<CacheEntry>) => {
      state.entries[action.payload.key] = action.payload;
    },
    
    removeCacheEntry: (state, action: PayloadAction<string>) => {
      delete state.entries[action.payload];
      state.ui.selectedKeys = state.ui.selectedKeys.filter(key => key !== action.payload);
    },
    
    updateCacheEntry: (state, action: PayloadAction<{ key: string; value: any; ttl?: number }>) => {
      const { key, value, ttl } = action.payload;
      if (state.entries[key]) {
        state.entries[key].value = value;
        state.entries[key].ttl = ttl;
        state.entries[key].timestamp = new Date().toISOString();
      }
    },
    
    clearAllEntries: (state) => {
      state.entries = {};
      state.ui.selectedKeys = [];
    },
    
    // Stats management
    updateStats: (state, action: PayloadAction<{ totalKeys: number; available: boolean }>) => {
      state.stats.totalKeys = action.payload.totalKeys;
      state.stats.available = action.payload.available;
      state.stats.lastUpdated = new Date().toISOString();
    },
    
    // Filters
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    
    setPattern: (state, action: PayloadAction<string>) => {
      state.filters.pattern = action.payload;
    },
    
    // UI state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.ui.error = action.payload;
    },
    
    showAddForm: (state) => {
      state.ui.showAddForm = true;
    },
    
    hideAddForm: (state) => {
      state.ui.showAddForm = false;
    },
    
    selectKey: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (!state.ui.selectedKeys.includes(key)) {
        state.ui.selectedKeys.push(key);
      }
    },
    
    deselectKey: (state, action: PayloadAction<string>) => {
      state.ui.selectedKeys = state.ui.selectedKeys.filter(key => key !== action.payload);
    },
    
    toggleKeySelection: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const index = state.ui.selectedKeys.indexOf(key);
      if (index === -1) {
        state.ui.selectedKeys.push(key);
      } else {
        state.ui.selectedKeys.splice(index, 1);
      }
    },
    
    clearSelectedKeys: (state) => {
      state.ui.selectedKeys = [];
    },
    
    selectAllKeys: (state) => {
      state.ui.selectedKeys = Object.keys(state.entries);
    },
    
    setViewMode: (state, action: PayloadAction<'list' | 'json'>) => {
      state.ui.viewMode = action.payload;
    },
    
    // Cache operations helpers
    addTemporaryEntry: (state, action: PayloadAction<{ key: string; value: any; ttl?: number }>) => {
      const { key, value, ttl } = action.payload;
      state.entries[key] = {
        key,
        value,
        ttl,
        timestamp: new Date().toISOString(),
      };
    },
    
    // Reset state
    resetCacheState: () => initialState,
  },
});

export const {
  // Cache entries
  setCacheEntry,
  removeCacheEntry,
  updateCacheEntry,
  clearAllEntries,
  addTemporaryEntry,
  
  // Stats
  updateStats,
  
  // Filters
  setSearchFilter,
  setPattern,
  
  // UI actions
  setLoading,
  setError,
  showAddForm,
  hideAddForm,
  selectKey,
  deselectKey,
  toggleKeySelection,
  clearSelectedKeys,
  selectAllKeys,
  setViewMode,
  resetCacheState,
} = cacheSlice.actions;

export default cacheSlice.reducer;