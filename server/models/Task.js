const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better query performance
taskSchema.index({ completed: 1, createdAt: -1 });

// Virtual for task status display
taskSchema.virtual('status').get(function() {
  return this.completed ? 'completed' : 'pending';
});

// Transform output to match frontend interface
taskSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;