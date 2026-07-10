const mongoose = require('mongoose');
require('dotenv').config();
require('./models/Plan');
const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sunrise_fitness');
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: 'admin' });
    console.log('\n--- ADMIN NOTIFICATIONS ---');
    admins.forEach(admin => {
      console.log(`Admin Email: ${admin.email}`);
      console.log(`Notifications Count: ${admin.notifications.length}`);
      console.log('Notifications List:');
      admin.notifications.forEach((n, idx) => {
        console.log(`  [${idx}] Message: "${n.message}" | Read: ${n.read}`);
      });
      console.log('--------------------');
    });

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error(err);
  }
}

run();
