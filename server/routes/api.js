const express = require('express');
const router = express.Router();
const { User, Task } = require('../models');

// GET /api - API info
router.get('/', (req, res) => {
  res.json({
    message: 'Full Stack Task & User Management API',
    version: '1.0.0',
    endpoints: {
      tasks: {
        'GET /api/tasks': 'Get all tasks',
        'POST /api/tasks': 'Create new task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      }
    }
  });
});

// 1. GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    
    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// 2. CREATE new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, age, profile } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    const user = new User({
      name,
      email,
      age,
      profile
    });
    
    const savedUser = await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// 3. GET user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User found',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// 4. UPDATE user by ID
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, profile } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    // Check if another user has this email
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Another user with this email already exists'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, age, profile },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// 5. DELETE user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// =============================================================================
// TASK API ENDPOINTS
// =============================================================================

// 1. GET /api/tasks - Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const { completed, sort = '-createdAt' } = req.query;
    
    let query = {};
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    const tasks = await Task.find(query).sort(sort);
    
    res.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// 2. POST /api/tasks - Create new task
router.post('/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }
    
    const taskData = {
      title: title.trim(),
      completed: false
    };
    
    if (description && description.trim()) {
      taskData.description = description.trim();
    }
    
    const task = new Task(taskData);
    await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// 3. PUT /api/tasks/:id - Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format'
      });
    }
    
    const updateData = {};
    
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Task title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description.trim() || undefined;
    }
    
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }
    
    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// 4. DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format'
      });
    }
    
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

module.exports = router;