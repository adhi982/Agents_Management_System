const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const TaskAssignment = require('./models/TaskAssignment');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_agent_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await TaskAssignment.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin 1 (let the model hash the password)
    const admin1 = new User({
      name: 'John Smith',
      email: 'admin1@example.com',
      password: 'password123',
      mobileNumber: '+1234567890',
      role: 'admin',
      isActive: true
    });
    await admin1.save();
    console.log('Created Admin 1: John Smith');

    // Create Admin 2 (let the model hash the password)
    const admin2 = new User({
      name: 'Sarah Johnson',
      email: 'admin2@example.com',
      password: 'password123',
      mobileNumber: '+1234567891',
      role: 'admin',
      isActive: true
    });
    await admin2.save();
    console.log('Created Admin 2: Sarah Johnson');

    // Create Agents under Admin 1
    const agent1 = new User({
      name: 'Mike Wilson',
      email: 'agent1@example.com',
      password: 'password123',
      mobileNumber: '+1234567892',
      role: 'agent',
      agentNumber: 'AGT001',
      isActive: true,
      createdBy: admin1._id,
      managedBy: admin1._id
    });
    await agent1.save();

    const agent2 = new User({
      name: 'Lisa Davis',
      email: 'agent2@example.com',
      password: 'password123',
      mobileNumber: '+1234567893',
      role: 'agent',
      agentNumber: 'AGT002',
      isActive: true,
      createdBy: admin1._id,
      managedBy: admin1._id
    });
    await agent2.save();
    console.log('Created Agents under Admin 1: Mike Wilson, Lisa Davis');

    // Create Agents under Admin 2
    const agent3 = new User({
      name: 'David Brown',
      email: 'agent3@example.com',
      password: 'password123',
      mobileNumber: '+1234567894',
      role: 'agent',
      agentNumber: 'AGT003',
      isActive: true,
      createdBy: admin2._id,
      managedBy: admin2._id
    });
    await agent3.save();

    const agent4 = new User({
      name: 'Emma Martinez',
      email: 'agent4@example.com',
      password: 'password123',
      mobileNumber: '+1234567895',
      role: 'agent',
      agentNumber: 'AGT004',
      isActive: false, // Making one agent inactive to show status variety
      createdBy: admin2._id,
      managedBy: admin2._id
    });
    await agent4.save();
    console.log('Created Agents under Admin 2: David Brown, Emma Martinez');

    // Create Sub-agents under Agent 1
    const subAgent1 = new User({
      name: 'Alex Thompson',
      email: 'subagent1@example.com',
      password: 'password123',
      mobileNumber: '+1234567896',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent1._id,
      managedBy: agent1._id
    });
    await subAgent1.save();

    const subAgent2 = new User({
      name: 'Jessica Lee',
      email: 'subagent2@example.com',
      password: 'password123',
      mobileNumber: '+1234567897',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent1._id,
      managedBy: agent1._id
    });
    await subAgent2.save();
    console.log('Created Sub-agents under Agent 1: Alex Thompson, Jessica Lee');

    // Create Sub-agents under Agent 2
    const subAgent3 = new User({
      name: 'Ryan Garcia',
      email: 'subagent3@example.com',
      password: 'password123',
      mobileNumber: '+1234567898',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent2._id,
      managedBy: agent2._id
    });
    await subAgent3.save();

    const subAgent4 = new User({
      name: 'Ashley White',
      email: 'subagent4@example.com',
      password: 'password123',
      mobileNumber: '+1234567899',
      role: 'sub-agent',
      isActive: true, // Making sub-agent active
      createdBy: agent2._id,
      managedBy: agent2._id
    });
    await subAgent4.save();
    console.log('Created Sub-agents under Agent 2: Ryan Garcia, Ashley White');

    // Create Sub-agents under Agent 3 (Admin 2's team)
    const subAgent5 = new User({
      name: 'Daniel Kim',
      email: 'subagent5@example.com',
      password: 'password123',
      mobileNumber: '+1234567800',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent3._id,
      managedBy: agent3._id
    });
    await subAgent5.save();

    const subAgent6 = new User({
      name: 'Sophia Chen',
      email: 'subagent6@example.com',
      password: 'password123',
      mobileNumber: '+1234567801',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent3._id,
      managedBy: agent3._id
    });
    await subAgent6.save();
    console.log('Created Sub-agents under Agent 3: Daniel Kim, Sophia Chen');

    // Create Sub-agents under Agent 4 (Admin 2's team)
    const subAgent7 = new User({
      name: 'Kevin Rodriguez',
      email: 'subagent7@example.com',
      password: 'password123',
      mobileNumber: '+1234567802',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent4._id,
      managedBy: agent4._id
    });
    await subAgent7.save();

    const subAgent8 = new User({
      name: 'Maya Patel',
      email: 'subagent8@example.com',
      password: 'password123',
      mobileNumber: '+1234567803',
      role: 'sub-agent',
      isActive: true,
      createdBy: agent4._id,
      managedBy: agent4._id
    });
    await subAgent8.save();
    console.log('Created Sub-agents under Agent 4: Kevin Rodriguez, Maya Patel');

    // Create sample task assignments
    const taskAssignments = [
      {
        assignedTo: subAgent1._id,
        assignedBy: agent1._id,
        title: 'Follow up with premium leads',
        description: 'Contact the premium leads from the latest upload',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        assignedTo: subAgent2._id,
        assignedBy: agent1._id,
        title: 'Update client database',
        description: 'Enter new client information into the system',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        assignedTo: subAgent5._id,
        assignedBy: agent3._id,
        title: 'Qualify new leads',
        description: 'Review and qualify incoming leads based on criteria',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      }
    ];

    await TaskAssignment.insertMany(taskAssignments);
    console.log('Created sample task assignments');

    console.log('\n=== NEW HIERARCHY SEED DATA CREATED ===');
    console.log('\nAdmin 1 (John Smith) - admin1@example.com:');
    console.log('  - Agent 1 (Mike Wilson) - agent1@example.com:');
    console.log('    - Sub-agent 1 (Alex Thompson) - subagent1@example.com');
    console.log('    - Sub-agent 2 (Jessica Lee) - subagent2@example.com');
    console.log('  - Agent 2 (Lisa Davis) - agent2@example.com:');
    console.log('    - Sub-agent 3 (Ryan Garcia) - subagent3@example.com');
    console.log('    - Sub-agent 4 (Ashley White) - subagent4@example.com');
    console.log('\nAdmin 2 (Sarah Johnson) - admin2@example.com:');
    console.log('  - Agent 3 (David Brown) - agent3@example.com:');
    console.log('    - Sub-agent 5 (Daniel Kim) - subagent5@example.com');
    console.log('    - Sub-agent 6 (Sophia Chen) - subagent6@example.com');
    console.log('  - Agent 4 (Emma Martinez) - agent4@example.com:');
    console.log('    - Sub-agent 7 (Kevin Rodriguez) - subagent7@example.com');
    console.log('    - Sub-agent 8 (Maya Patel) - subagent8@example.com');
    console.log('\nAll users have password: password123');
    console.log('\nNEW HIERARCHY: Admin → Agent → Sub-Agent');
    console.log('- Admins can create/edit Agents');
    console.log('- Agents can create/edit Sub-Agents');
    console.log('- No team hierarchy display in dashboard');
    console.log('\nDatabase seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase();
