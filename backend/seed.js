const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Agent = require('./models/Agent');

// Sample data for two different admins
const sampleAdmins = [
  {
    name: 'John Admin',
    email: 'admin1@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Sarah Admin',
    email: 'admin2@example.com',
    password: 'admin123',
    role: 'admin'
  }
];

// Agents for Admin 1 (John)
const admin1Agents = [
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
  }
];

// Agents for Admin 2 (Sarah)
const admin2Agents = [
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
  },
  {
    name: 'Agent Miller',
    email: 'miller@agents.com',
    mobileNumber: '+1234567895',
    password: 'agent123'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Agent.deleteMany({});
    console.log('Cleared existing data');

    // Create both admin users
    const admin1 = new User(sampleAdmins[0]);
    await admin1.save();
    console.log('Admin 1 created:', admin1.email, admin1.name);

    const admin2 = new User(sampleAdmins[1]);
    await admin2.save();
    console.log('Admin 2 created:', admin2.email, admin2.name);

    // Create agents for Admin 1
    console.log('\nCreating agents for Admin 1...');
    for (const agentData of admin1Agents) {
      const agent = new Agent({
        ...agentData,
        createdBy: admin1._id
      });
      await agent.save();
      console.log(`Agent created for Admin 1: ${agent.name} (${agent.email})`);
    }

    // Create agents for Admin 2
    console.log('\nCreating agents for Admin 2...');
    for (const agentData of admin2Agents) {
      const agent = new Agent({
        ...agentData,
        createdBy: admin2._id
      });
      await agent.save();
      console.log(`Agent created for Admin 2: ${agent.name} (${agent.email})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('👤 Admin 1:');
    console.log('   Email: admin1@example.com');
    console.log('   Password: admin123');
    console.log('   Agents: 3 (Smith, Johnson, Williams)');
    console.log('\n� Admin 2:');
    console.log('   Email: admin2@example.com');
    console.log('   Password: admin123');
    console.log('   Agents: 3 (Brown, Davis, Miller)');
    console.log('\n🔒 Each admin can only see their own agents!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase();
