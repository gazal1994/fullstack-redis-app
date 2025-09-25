const mongoose = require('mongoose');

// MongoDB connection configuration
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    
    const conn = await mongoose.connect(connectionString, {
      // Remove deprecated options as they're now default in Mongoose 6+
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit process, let the app continue without DB if needed
    return null;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful close on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// MongoDB helper functions
const mongoHelpers = {
  // Check if MongoDB is connected
  isConnected: () => {
    return mongoose.connection.readyState === 1;
  },

  // Get connection status
  getConnectionStatus: () => {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  },

  // Close connection
  closeConnection: async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      return true;
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      return false;
    }
  }
};

module.exports = {
  connectDB,
  mongoose,
  ...mongoHelpers
};