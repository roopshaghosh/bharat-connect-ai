const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const BloodDonor = require('./models/BloodDonor');
const BloodRequest = require('./models/BloodRequest');
const Notification = require('./models/Notification');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bharat-connect');
    console.log('Connected to MongoDB.');

    const users = await User.find({});
    console.log('\n=== USERS ===');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.fullname}, Role: ${u.role}, City: ${u.location}, BG: ${u.bloodGroup}, Donor?: ${u.isBloodDonor}`);
    });

    const donors = await BloodDonor.find({});
    console.log('\n=== BLOOD DONORS ===');
    donors.forEach(d => {
      console.log(`ID: ${d._id}, UserID: ${d.user}, City: ${d.city}, BG: ${d.bloodGroup}, Available: ${d.available}`);
    });

    const requests = await BloodRequest.find({});
    console.log('\n=== BLOOD REQUESTS ===');
    requests.forEach(r => {
      console.log(`ID: ${r._id}, PostedBy: ${r.postedBy}, Patient: ${r.patientName}, City: ${r.city}, BG: ${r.bloodGroup}`);
    });

    const notifications = await Notification.find({});
    console.log('\n=== NOTIFICATIONS ===');
    notifications.slice(-15).forEach(n => {
      console.log(`User: ${n.user}, Title: ${n.title}, Message: ${n.message}, CreatedAt: ${n.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
