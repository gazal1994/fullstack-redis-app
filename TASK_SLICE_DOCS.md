# TaskSlice Redux Integration

This document describes the taskSlice implementation for managing task UI state.

## Features

### 🔍 **Filtering & Search**
- Filter by task status: All, Pending, Completed
- Search tasks by title or description
- Toggle visibility of completed tasks

### 📊 **Sorting**
- Sort by: Date Created, Title, Status
- Toggle sort order: Ascending/Descending
- Click sort field again to reverse order

### 🎯 **Selection & Bulk Actions**
- Select individual tasks for bulk operations
- Select all/none toggle
- Bulk action mode for multi-task operations

### 👁️ **View Modes**
- List view: Detailed task information
- Grid view: Card-based layout (coming soon)
- Compact view: Minimal information (coming soon)

### 📄 **Pagination**
- Configurable items per page
- Page navigation for large task lists

## Redux State Structure

```typescript
interface TaskUIState {
  // Filtering and sorting
  filter: 'all' | 'completed' | 'pending';
  sortBy: 'createdAt' | 'title' | 'completed';
  sortOrder: 'asc' | 'desc';
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
  
  // Action feedback
  lastAction: {
    type: 'create' | 'update' | 'delete' | 'bulk' | null;
    success: boolean;
    message: string;
    timestamp: number;
  } | null;
}
```

## Usage Example

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { 
  setFilter, 
  setSortBy, 
  setSearchQuery,
  selectTaskFilter,
  selectTaskSort 
} from '../store/taskSlice';

function TaskComponent() {
  const dispatch = useDispatch();
  const filter = useSelector(selectTaskFilter);
  const { sortBy, sortOrder } = useSelector(selectTaskSort);
  
  // Update filter
  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };
  
  // Update sort
  const handleSortChange = (newSort) => {
    dispatch(setSortBy(newSort));
  };
  
  return (
    <div>
      <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="all">All Tasks</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
```

## Available Actions

- `setFilter(filter)` - Set task filter
- `setSortBy(sortBy)` - Set sort field (toggles order if same)
- `setSearchQuery(query)` - Set search query
- `selectTask(id)` - Select a task for bulk actions
- `clearSelection()` - Clear all selections
- `setBulkActionMode(boolean)` - Enable/disable bulk mode
- `resetFilters()` - Reset all filters to defaults
- `resetUIState()` - Reset all UI state

## Available Selectors

- `selectTaskFilter` - Current filter setting
- `selectTaskSort` - Current sort settings
- `selectSearchQuery` - Current search query
- `selectSelectedTaskIds` - Array of selected task IDs
- `selectBulkActionMode` - Bulk action mode status
- `selectViewMode` - Current view mode
- `selectLastAction` - Last action feedback

## Integration Benefits

1. **Centralized UI State** - All task UI state in one place
2. **Persistent Filters** - Filters persist across component rerenders
3. **Optimistic Updates** - UI updates immediately before API calls
4. **Action Feedback** - Success/error messages with timestamps
5. **Developer Experience** - Redux DevTools integration for debugging