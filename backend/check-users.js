const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-management');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'name email role');
    console.log('Users in database:');
    console.log(users);
    
    // Test specific user
    const admin1 = await User.findOne({ email: 'admin1@example.com' });
    if (admin1) {
      console.log('\nAdmin1 found:', admin1.email, admin1.role);
      console.log('Password hash length:', admin1.password?.length);
    } else {
      console.log('\nAdmin1 NOT found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers();
