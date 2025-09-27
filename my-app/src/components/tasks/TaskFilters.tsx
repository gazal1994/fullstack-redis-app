import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setFilter, 
  setSortBy, 
  setSearchQuery, 
  toggleShowCompleted,
  setBulkActionMode,
  setViewMode,
  resetFilters,
  selectTaskFilter,
  selectTaskSort,
  selectSearchQuery,
  selectShowCompleted,
  selectBulkActionMode,
  selectViewMode,
  type TaskFilter,
  type TaskSortBy
} from '../../store/taskSlice';
import type { RootState } from '../../store';

const TaskFilters: React.FC = () => {
  const dispatch = useDispatch();
  
  // Select state from taskSlice
  const filter = useSelector((state: RootState) => selectTaskFilter(state));
  const { sortBy, sortOrder } = useSelector((state: RootState) => selectTaskSort(state));
  const searchQuery = useSelector((state: RootState) => selectSearchQuery(state));
  const showCompleted = useSelector((state: RootState) => selectShowCompleted(state));
  const bulkActionMode = useSelector((state: RootState) => selectBulkActionMode(state));
  const viewMode = useSelector((state: RootState) => selectViewMode(state));

  const handleFilterChange = (newFilter: TaskFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleSortChange = (newSortBy: TaskSortBy) => {
    dispatch(setSortBy(newSortBy));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <div className="task-filters">
      <div className="filters-row">
        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search">Search Tasks:</label>
          <input
            id="search"
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Filter by completion status */}
        <div className="filter-group">
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as TaskFilter)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>

        {/* Sort options */}
        <div className="filter-group">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as TaskSortBy)}
            className="filter-select"
          >
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="completed">Status</option>
          </select>
          <span className="sort-order">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        </div>
      </div>

      <div className="filters-row">
        {/* Show/Hide completed toggle */}
        <div className="filter-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => dispatch(toggleShowCompleted())}
            />
            Show Completed Tasks
          </label>
        </div>

        {/* View mode */}
        <div className="filter-group">
          <label>View:</label>
          <div className="view-mode-buttons">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('list'))}
            >
              📋 List
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('grid'))}
            >
              ⚏ Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('compact'))}
            >
              ☰ Compact
            </button>
          </div>
        </div>

        {/* Bulk actions toggle */}
        <div className="filter-group">
          <button
            className={`bulk-action-btn ${bulkActionMode ? 'active' : ''}`}
            onClick={() => dispatch(setBulkActionMode(!bulkActionMode))}
          >
            {bulkActionMode ? '✓ Exit Bulk Mode' : '☑ Bulk Actions'}
          </button>
        </div>

        {/* Reset filters */}
        <div className="filter-group">
          <button
            className="reset-btn"
            onClick={handleResetFilters}
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Active filters summary */}
      {(filter !== 'all' || searchQuery || !showCompleted) && (
        <div className="active-filters">
          <span>Active filters:</span>
          {filter !== 'all' && (
            <span className="filter-tag">
              Status: {filter} ×
            </span>
          )}
          {searchQuery && (
            <span className="filter-tag">
              Search: "{searchQuery}" ×
            </span>
          )}
          {!showCompleted && (
            <span className="filter-tag">
              Hide completed ×
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;