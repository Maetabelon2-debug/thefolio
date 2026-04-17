// backend/seedAdmin.js
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await connectDB();
    
    // Delete existing admin if any (optional)
    await User.deleteOne({ email: 'admin@thefolio.com' });
    
    // Create fresh admin account
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@thefolio.com',
      password: 'Admin@1234',
      role: 'admin',
      status: 'active',
      bio: 'Site Administrator',
      profilePic: ''
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@thefolio.com');
    console.log('🔑 Password: Admin@1234');
    console.log('👤 Role: admin');
    
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();