// backend/test.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/thefolio');
    console.log('✅ MongoDB connected');
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String
    }));
    
    const user = await User.findOne({ email: 'admin@thefolio.com' });
    if (user) {
      console.log('✅ Admin found:', user.email);
      console.log('✅ Hashed password stored:', user.password);
    } else {
      console.log('❌ Admin not found - run node seedAdmin.js');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();