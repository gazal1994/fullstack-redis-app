#!/usr/bin/env node

// Simple API test script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Task API Endpoints...\n');

  try {
    // Test 1: Get API info
    console.log('1. Testing GET /api');
    const info = await axios.get(`${BASE_URL}/`);
    console.log('✅ API Info:', info.data.message);
    
    // Test 2: Create a task
    console.log('\n2. Testing POST /api/tasks');
    const newTask = await axios.post(`${BASE_URL}/tasks`, {
      title: 'Test Task from API',
      description: 'This is a test task created via API'
    });
    console.log('✅ Created task:', newTask.data.data);
    const taskId = newTask.data.data.id;
    
    // Test 3: Get all tasks
    console.log('\n3. Testing GET /api/tasks');
    const tasks = await axios.get(`${BASE_URL}/tasks`);
    console.log(`✅ Retrieved ${tasks.data.count} tasks`);
    
    // Test 4: Update the task
    console.log('\n4. Testing PUT /api/tasks/:id');
    const updatedTask = await axios.put(`${BASE_URL}/tasks/${taskId}`, {
      title: 'Updated Test Task',
      completed: true
    });
    console.log('✅ Updated task:', updatedTask.data.data);
    
    // Test 5: Delete the task
    console.log('\n5. Testing DELETE /api/tasks/:id');
    const deletedTask = await axios.delete(`${BASE_URL}/tasks/${taskId}`);
    console.log('✅ Deleted task:', deletedTask.data.data);
    
    console.log('\n🎉 All API tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running on port 5000');
    console.log('Run: cd server && npm run dev');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;