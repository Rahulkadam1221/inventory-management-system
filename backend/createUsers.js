const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        role: 'User'
      });
      console.log('Regular user created successfully');
    } else {
      console.log('Regular user already exists');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createTestUser();
