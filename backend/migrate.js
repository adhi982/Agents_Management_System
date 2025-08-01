const mongoose = require('mongoose');
const Agent = require('./models/Agent');
const DistributedList = require('./models/DistributedList');
const User = require('./models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateData = async () => {
  try {
    await connectDB();

    // Get the first admin user (you may want to specify a particular admin)
    const firstAdmin = await User.findOne({ role: 'admin' });
    if (!firstAdmin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin: ${firstAdmin.name} (${firstAdmin.email}) as default owner`);

    // Update all agents without createdBy field
    const agentsUpdated = await Agent.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: firstAdmin._id } }
    );
    console.log(`Updated ${agentsUpdated.modifiedCount} agents with createdBy field`);

    // Update all distributions without createdBy field
    const distributionsUpdated = await DistributedList.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: firstAdmin._id } }
    );
    console.log(`Updated ${distributionsUpdated.modifiedCount} distributions with createdBy field`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateData();
