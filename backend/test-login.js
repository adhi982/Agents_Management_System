const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-management');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin1@example.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    
    // Test password comparison
    const testPassword = 'password123';
    console.log('Testing password:', testPassword);
    
    // Direct bcrypt comparison
    const directMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt compare result:', directMatch);
    
    // Using user method
    const methodMatch = await user.comparePassword(testPassword);
    console.log('User method compare result:', methodMatch);
    
    // Test with wrong password
    const wrongMatch = await user.comparePassword('wrongpassword');
    console.log('Wrong password result:', wrongMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testLogin();
