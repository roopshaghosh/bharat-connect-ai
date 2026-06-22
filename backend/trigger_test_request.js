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

    const userId = '6a38cb87557ebff13c4e3d4f'; // yash
    const user = await User.findById(userId);
    if (!user) {
      console.log('User yash not found.');
      process.exit(1);
    }

    // Force user to be blood donor in DB
    user.isBloodDonor = true;
    user.bloodGroup = 'A+';
    user.location = 'Mumbai';
    await user.save();
    console.log(`Updated user ${user.fullname} to be an active blood donor.`);

    // Sync with BloodDonor collection
    let donor = await BloodDonor.findOne({ user: userId });
    if (!donor) {
      donor = await BloodDonor.create({
        user: userId,
        bloodGroup: 'A+',
        city: 'Mumbai',
        available: true
      });
      console.log('Created BloodDonor document for yash.');
    } else {
      donor.bloodGroup = 'A+';
      donor.city = 'Mumbai';
      donor.available = true;
      await donor.save();
      console.log('Updated existing BloodDonor document for yash.');
    }

    // Now let's trigger a blood request in Mumbai for A+ posted by ngo_test
    const ngoId = '6a38d1df09aa9ca9d6ffad16'; // ngo_test
    const bloodRequest = await BloodRequest.create({
      requester: ngoId,
      postedBy: ngoId,
      patientName: 'Test Patient A+',
      bloodGroup: 'A+',
      unitsNeeded: 2,
      hospital: 'Lilavati Hospital',
      city: 'Mumbai',
      location: 'Bandra, Mumbai',
      contactNumber: '+91 99999 88888',
      urgency: 'critical',
      status: 'pending'
    });
    console.log(`Created new A+ Blood Request ID: ${bloodRequest._id} in Mumbai.`);

    // Trigger notification manually matching the controller logic
    const nearbyDonors = await BloodDonor.find({
      city: { $regex: new RegExp(`^Mumbai$`, 'i') },
      available: true,
      user: { $ne: ngoId }
    });

    console.log(`Found ${nearbyDonors.length} nearby donors in Mumbai:`, nearbyDonors.map(d => d.user));

    for (const d of nearbyDonors) {
      const notification = await Notification.create({
        user: d.user,
        title: 'Emergency Blood Request Nearby 🚨',
        message: `A critical blood request for group A+ is needed at Lilavati Hospital in Mumbai. Please help if you can!`,
        read: false
      });
      console.log(`Created notification ID ${notification._id} for user ${d.user}`);
    }

    console.log('Test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
