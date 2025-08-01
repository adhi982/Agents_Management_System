const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Agent = require('./models/Agent');
const TaskAssignment = require('./models/TaskAssignment');

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
    await TaskAssignment.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin 1 (let the model hash the password)
    const admin1 = new User({
      name: 'John Smith',
      email: 'admin1@example.com',
      password: 'password123',
      mobileNumber: '+1234567890',
      role: 'admin'
    });
    await admin1.save();
    console.log('Created Admin 1: John Smith');

    // Create Admin 2 (let the model hash the password)
    const admin2 = new User({
      name: 'Sarah Johnson',
      email: 'admin2@example.com',
      password: 'password123',
      mobileNumber: '+1234567891',
      role: 'admin'
    });
    await admin2.save();
    console.log('Created Admin 2: Sarah Johnson');

    // Create Managers under Admin 1
    const manager1 = new User({
      name: 'Mike Wilson',
      email: 'manager1@example.com',
      password: 'password123',
      mobileNumber: '+1234567892',
      role: 'manager',
      createdBy: admin1._id,
      managedBy: admin1._id
    });
    await manager1.save();

    const manager2 = new User({
      name: 'Lisa Davis',
      email: 'manager2@example.com',
      password: 'password123',
      mobileNumber: '+1234567893',
      role: 'manager',
      createdBy: admin1._id,
      managedBy: admin1._id
    });
    await manager2.save();
    console.log('Created Managers under Admin 1: Mike Wilson, Lisa Davis');

    // Create Managers under Admin 2
    const manager3 = new User({
      name: 'David Brown',
      email: 'manager3@example.com',
      password: 'password123',
      mobileNumber: '+1234567894',
      role: 'manager',
      createdBy: admin2._id,
      managedBy: admin2._id
    });
    await manager3.save();

    const manager4 = new User({
      name: 'Emma Martinez',
      email: 'manager4@example.com',
      password: 'password123',
      mobileNumber: '+1234567895',
      role: 'manager',
      createdBy: admin2._id,
      managedBy: admin2._id
    });
    await manager4.save();
    console.log('Created Managers under Admin 2: David Brown, Emma Martinez');

    // Create Sub-agents under Manager 1
    const subAgent1 = new User({
      name: 'Alex Thompson',
      email: 'agent1@example.com',
      password: 'password123',
      mobileNumber: '+1234567896',
      role: 'sub-agent',
      createdBy: manager1._id,
      managedBy: manager1._id
    });
    await subAgent1.save();

    const subAgent2 = new User({
      name: 'Jessica Lee',
      email: 'agent2@example.com',
      password: 'password123',
      mobileNumber: '+1234567897',
      role: 'sub-agent',
      createdBy: manager1._id,
      managedBy: manager1._id
    });
    await subAgent2.save();
    console.log('Created Sub-agents under Manager 1: Alex Thompson, Jessica Lee');

    // Create Sub-agents under Manager 2
    const subAgent3 = new User({
      name: 'Ryan Garcia',
      email: 'agent3@example.com',
      password: 'password123',
      mobileNumber: '+1234567898',
      role: 'sub-agent',
      createdBy: manager2._id,
      managedBy: manager2._id
    });
    await subAgent3.save();

    const subAgent4 = new User({
      name: 'Ashley White',
      email: 'agent4@example.com',
      password: 'password123',
      mobileNumber: '+1234567899',
      role: 'sub-agent',
      createdBy: manager2._id,
      managedBy: manager2._id
    });
    await subAgent4.save();
    console.log('Created Sub-agents under Manager 2: Ryan Garcia, Ashley White');

    // Create Sub-agents under Manager 3 (Admin 2's team)
    const subAgent5 = new User({
      name: 'Daniel Kim',
      email: 'agent5@example.com',
      password: 'password123',
      mobileNumber: '+1234567800',
      role: 'sub-agent',
      createdBy: manager3._id,
      managedBy: manager3._id
    });
    await subAgent5.save();

    const subAgent6 = new User({
      name: 'Sophia Chen',
      email: 'agent6@example.com',
      password: 'password123',
      mobileNumber: '+1234567801',
      role: 'sub-agent',
      createdBy: manager3._id,
      managedBy: manager3._id
    });
    await subAgent6.save();
    console.log('Created Sub-agents under Manager 3: Daniel Kim, Sophia Chen');

    // Create Sub-agents under Manager 4 (Admin 2's team)
    const subAgent7 = new User({
      name: 'Kevin Rodriguez',
      email: 'agent7@example.com',
      password: 'password123',
      mobileNumber: '+1234567802',
      role: 'sub-agent',
      createdBy: manager4._id,
      managedBy: manager4._id
    });
    await subAgent7.save();

    const subAgent8 = new User({
      name: 'Maya Patel',
      email: 'agent8@example.com',
      password: 'password123',
      mobileNumber: '+1234567803',
      role: 'sub-agent',
      createdBy: manager4._id,
      managedBy: manager4._id
    });
    await subAgent8.save();
    console.log('Created Sub-agents under Manager 4: Kevin Rodriguez, Maya Patel');

    // Create sample task assignments
    const taskAssignments = [
      {
        assignedTo: subAgent1._id,
        assignedBy: manager1._id,
        title: 'Follow up with premium leads',
        description: 'Contact the premium leads from the latest upload',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        assignedTo: subAgent2._id,
        assignedBy: manager1._id,
        title: 'Update client database',
        description: 'Enter new client information into the system',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        assignedTo: subAgent5._id,
        assignedBy: manager3._id,
        title: 'Qualify new leads',
        description: 'Review and qualify incoming leads based on criteria',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      }
    ];

    await TaskAssignment.insertMany(taskAssignments);
    console.log('Created sample task assignments');

    console.log('\n=== HIERARCHICAL SEED DATA CREATED ===');
    console.log('\nAdmin 1 (John Smith) - admin1@example.com:');
    console.log('  - Manager 1 (Mike Wilson) - manager1@example.com:');
    console.log('    - Sub-agent 1 (Alex Thompson) - agent1@example.com');
    console.log('    - Sub-agent 2 (Jessica Lee) - agent2@example.com');
    console.log('  - Manager 2 (Lisa Davis) - manager2@example.com:');
    console.log('    - Sub-agent 3 (Ryan Garcia) - agent3@example.com');
    console.log('    - Sub-agent 4 (Ashley White) - agent4@example.com');
    console.log('\nAdmin 2 (Sarah Johnson) - admin2@example.com:');
    console.log('  - Manager 3 (David Brown) - manager3@example.com:');
    console.log('    - Sub-agent 5 (Daniel Kim) - agent5@example.com');
    console.log('    - Sub-agent 6 (Sophia Chen) - agent6@example.com');
    console.log('  - Manager 4 (Emma Martinez) - manager4@example.com:');
    console.log('    - Sub-agent 7 (Kevin Rodriguez) - agent7@example.com');
    console.log('    - Sub-agent 8 (Maya Patel) - agent8@example.com');
    console.log('\nAll users have password: password123');
    console.log('\nDatabase seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase();
