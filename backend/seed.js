const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Agent = require('./models/Agent');

// Sample data
const sampleAdmin = {
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const sampleAgents = [
  {
    name: 'Agent Smith',
    email: 'smith@agents.com',
    mobileNumber: '+1234567890',
    password: 'agent123'
  },
  {
    name: 'Agent Johnson',
    email: 'johnson@agents.com',
    mobileNumber: '+1234567891',
    password: 'agent123'
  },
  {
    name: 'Agent Williams',
    email: 'williams@agents.com',
    mobileNumber: '+1234567892',
    password: 'agent123'
  },
  {
    name: 'Agent Brown',
    email: 'brown@agents.com',
    mobileNumber: '+1234567893',
    password: 'agent123'
  },
  {
    name: 'Agent Davis',
    email: 'davis@agents.com',
    mobileNumber: '+1234567894',
    password: 'agent123'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Agent.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User(sampleAdmin);
    await admin.save();
    console.log('Admin user created:', admin.email);

    // Create sample agents
    for (const agentData of sampleAgents) {
      const agent = new Agent(agentData);
      await agent.save();
      console.log('Agent created:', agent.name);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin Email: admin@example.com');
    console.log('Admin Password: admin123');
    console.log('\n🎯 5 sample agents have been created with password: agent123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase();
