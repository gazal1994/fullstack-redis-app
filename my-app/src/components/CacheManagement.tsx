import React, { useState, useEffect } from 'react';
import {
  useGetCacheStatsQuery,
  useGetRedisKeysQuery,
  useSetCacheValueMutation,
  useDeleteCacheValueMutation,
  useFlushRedisMutation,
  usePingRedisQuery,
} from '../store/apiSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSearchFilter,
  setPattern,
  showAddForm,
  hideAddForm,
  toggleKeySelection,
  clearSelectedKeys,
  setViewMode,
} from '../store/cacheSlice';

interface CacheFormData {
  key: string;
  value: string;
  ttl: string;
}

const CacheManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, ui } = useAppSelector((state) => state.cache);
  
  // API hooks
  const { data: statsData, refetch: refetchStats } = useGetCacheStatsQuery();
  const { data: keysData, refetch: refetchKeys } = useGetRedisKeysQuery(filters.pattern);
  const { data: pingData, refetch: pingRedis } = usePingRedisQuery();
  const [setCacheValue, { isLoading: setLoading }] = useSetCacheValueMutation();
  const [deleteCacheValue, { isLoading: deleteLoading }] = useDeleteCacheValueMutation();
  const [flushRedis, { isLoading: flushLoading }] = useFlushRedisMutation();
  
  // Local form state
  const [formData, setFormData] = useState<CacheFormData>({
    key: '',
    value: '',
    ttl: '',
  });

  // Auto-refresh stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchKeys();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchKeys]);

  const keys = keysData?.data?.keys || [];
  const filteredKeys = keys.filter(key =>
    key.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleSetCache = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedValue: any = formData.value;
      
      // Try to parse as JSON
      try {
        parsedValue = JSON.parse(formData.value);
      } catch {
        // Keep as string if not valid JSON
      }

      await setCacheValue({
        key: formData.key,
        value: parsedValue,
        ttl: formData.ttl ? parseInt(formData.ttl) : undefined,
      }).unwrap();
      
      setFormData({ key: '', value: '', ttl: '' });
      dispatch(hideAddForm());
      refetchKeys();
      refetchStats();
    } catch (error) {
      console.error('Failed to set cache value:', error);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (window.confirm(`Are you sure you want to delete key "${key}"?`)) {
      try {
        await deleteCacheValue(key).unwrap();
        refetchKeys();
        refetchStats();
      } catch (error) {
        console.error('Failed to delete cache key:', error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (ui.selectedKeys.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${ui.selectedKeys.length} keys?`)) {
      try {
        await Promise.all(ui.selectedKeys.map(key => deleteCacheValue(key).unwrap()));
        dispatch(clearSelectedKeys());
        refetchKeys();
        refetchStats();
      } catch (error) {
        console.error('Failed to delete selected keys:', error);
      }
    }
  };

  const handleFlushAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL Redis data? This cannot be undone!')) {
      try {
        await flushRedis().unwrap();
        dispatch(clearSelectedKeys());
        refetchKeys();
        refetchStats();
      } catch (error) {
        console.error('Failed to flush Redis:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Redis Cache Management</h1>
      
      {/* Redis Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Redis Status</h2>
          <button
            onClick={() => pingRedis()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ping
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            pingData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {pingData ? 'Connected' : 'Disconnected'}
          </span>
          {pingData && (
            <span className="text-sm text-gray-600">
              Response: {pingData.data?.response}
            </span>
          )}
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Keys</h3>
          <p className="text-2xl font-bold text-gray-900">
            {statsData?.data?.totalKeys || 0}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Filtered Keys</h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredKeys.length}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Selected</h3>
          <p className="text-2xl font-bold text-gray-900">
            {ui.selectedKeys.length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search keys..."
          value={filters.search}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Redis pattern (e.g., user:*)"
          value={filters.pattern}
          onChange={(e) => dispatch(setPattern(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => dispatch(showAddForm())}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500"
        >
          Add Key
        </button>
        <select
          value={ui.viewMode}
          onChange={(e) => dispatch(setViewMode(e.target.value as 'list' | 'json'))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="list">List View</option>
          <option value="json">JSON View</option>
        </select>
        {ui.selectedKeys.length > 0 && (
          <>
            <button
              onClick={handleDeleteSelected}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              Delete Selected ({ui.selectedKeys.length})
            </button>
          </>
        )}
        <button
          onClick={handleFlushAll}
          disabled={flushLoading}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 focus:ring-2 focus:ring-red-700 disabled:opacity-50"
        >
          Flush All
        </button>
      </div>

      {/* Add Cache Form */}
      {ui.showAddForm && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Cache Entry</h3>
          <form onSubmit={handleSetCache} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="TTL (seconds, optional)"
                value={formData.ttl}
                onChange={(e) => setFormData({ ...formData, ttl: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Value (JSON or string)"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={setLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {setLoading ? 'Setting...' : 'Set Value'}
              </button>
              <button
                type="button"
                onClick={() => dispatch(hideAddForm())}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Keys List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {keys.length === 0 ? 'No keys found' : 'No keys match your search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          filteredKeys.forEach(key => {
                            if (!ui.selectedKeys.includes(key)) {
                              dispatch(toggleKeySelection(key));
                            }
                          });
                        } else {
                          dispatch(clearSelectedKeys());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Key</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKeys.map((key) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={ui.selectedKeys.includes(key)}
                        onChange={() => dispatch(toggleKeySelection(key))}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">{key}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteKey(key)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheManagement;