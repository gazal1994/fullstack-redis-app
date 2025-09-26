import React, { useState, useEffect } from 'react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} from '../store/apiSlice';
import type { User } from '../store/apiSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setSearchFilter, 
  showCreateForm, 
  hideForms, 
  selectUser, 
  deselectUser,
  clearSelectedUsers,
  addUser,
  deleteUser as deleteUserFromState,
  setUsers
} from '../store/userSlice';

interface UserFormData {
  name: string;
  email: string;
  age: string;
  bio: string;
}

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, selectedUsers, ui, users: stateUsers } = useAppSelector((state) => state.user);
  
  // API hooks - USERS ONLY
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch } = useGetUsersQuery();
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  
  // Local form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    age: '',
    bio: '',
  });

  // Use state users or fallback to API data
  const users = stateUsers.length > 0 ? stateUsers : (usersData?.data || []);
  
  // Update Redux state when API data changes
  useEffect(() => {
    if (usersData?.data && usersData.data.length > 0) {
      dispatch(setUsers(usersData.data));
    }
  }, [usersData?.data, dispatch]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    user.email.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createUser({
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        profile: {
          bio: formData.bio,
        },
      }).unwrap();
      
      // Update Redux state immediately
      dispatch(addUser(result.data));
      
      setFormData({ name: '', email: '', age: '', bio: '' });
      dispatch(hideForms());
      refetch(); // Still refetch to ensure consistency
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
        
        // Update Redux state immediately
        dispatch(deleteUserFromState(userId));
        dispatch(deselectUser(userId));
        
        refetch(); // Still refetch to ensure consistency
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    if (isSelected) {
      dispatch(deselectUser(user._id));
    } else {
      dispatch(selectUser(user));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(user => deleteUser(user._id).unwrap()));
        
        // Update Redux state immediately
        selectedUsers.forEach(user => {
          dispatch(deleteUserFromState(user._id));
        });
        dispatch(clearSelectedUsers());
        
        refetch(); // Still refetch to ensure consistency
      } catch (error) {
        console.error('Failed to delete selected users:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {/* Simple Status */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <span className="text-green-600 font-semibold">✓ MongoDB Connected</span>
          <span className="text-sm text-gray-600">Direct database operations</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => dispatch(setSearchFilter(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => dispatch(setSearchFilter(''))}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => dispatch(showCreateForm())}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
        >
          Add User
        </button>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
          title="Refresh data from server"
        >
          🔄 Refresh
        </button>
        {selectedUsers.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deleteLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            Delete Selected ({selectedUsers.length})
          </button>
        )}
        <span className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Create User Form */}
      {ui.showCreateForm && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Age (optional)"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Bio (optional)"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => dispatch(hideForms())}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {usersLoading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : usersError ? (
          <div className="p-8 text-center text-red-500">
            Error loading users: {JSON.stringify(usersError)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
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
                          filteredUsers.forEach(user => {
                            if (!selectedUsers.some(u => u._id === user._id)) {
                              dispatch(selectUser(user));
                            }
                          });
                        } else {
                          dispatch(clearSelectedUsers());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Age</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.some(u => u._id === user._id)}
                        onChange={() => handleUserSelection(user)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">{user.age || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
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

export default UserManagement;