// backend/test-auth.js
const mongoose = require('mongoose');

// PASTE YOUR FULL CONNECTION STRING HERE (with real password)
const MONGO_URI = 'mongodb+srv://amtabelon23102783_db_user:< ClubKoqfvM7I3gSB>@thefolio.2ehtbqf.mongodb.net/?appName=thefolio';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Authentication successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

test();