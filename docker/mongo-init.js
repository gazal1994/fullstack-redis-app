// MongoDB Initialization Script
db = db.getSiblingDB('myapp');

// Create application user
db.createUser({
  user: 'appuser',
  pwd: 'apppass123',
  roles: [
    {
      role: 'readWrite',
      db: 'myapp'
    }
  ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('posts');

// Insert sample data
db.users.insertOne({
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date()
});

db.posts.insertOne({
  title: 'Welcome Post',
  content: 'Welcome to our full-stack application!',
  author: 'Admin User',
  createdAt: new Date()
});

print('Database initialized successfully');