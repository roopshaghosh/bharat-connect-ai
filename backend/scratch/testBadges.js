const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const SkillOpportunity = require('../models/SkillOpportunity');
const Application = require('../models/Application');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');

const { initializeBadges } = require('../config/badgeAwarder');
const { applyOpportunity, updateApplicationStatus } = require('../controllers/applicationController');
const { respondToRequest } = require('../controllers/bloodController');
const { getMe } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bharat_connect';

// Helper to generate mock response object
const makeMockRes = () => {
  return {
    statusCode: 200,
    jsonData: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.jsonData = data;
      return this;
    }
  };
};

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');

  // Seed master badges
  console.log('Seeding Master Badges...');
  await initializeBadges();

  const testVolunteerEmail = 'test_badge_volunteer@example.com';
  const testNgoEmail = 'test_badge_ngo@example.com';

  // Cleanup past test data
  console.log('Cleaning up old test users & data...');
  const existingVolunteer = await User.findOne({ email: testVolunteerEmail });
  const existingNgo = await User.findOne({ email: testNgoEmail });

  if (existingVolunteer) {
    await UserBadge.deleteMany({ user: existingVolunteer._id });
    await Application.deleteMany({ applicant: existingVolunteer._id });
    await BloodRequest.deleteMany({ requester: existingVolunteer._id });
    await Notification.deleteMany({ user: existingVolunteer._id });
    await User.deleteOne({ _id: existingVolunteer._id });
  }
  if (existingNgo) {
    await SkillOpportunity.deleteMany({ ngo: existingNgo._id });
    await BloodRequest.deleteMany({ requester: existingNgo._id });
    await User.deleteOne({ _id: existingNgo._id });
  }

  try {
    // 1. Create Volunteer and NGO Users
    console.log('\n--- 1. Creating Users ---');
    const volunteer = await User.create({
      fullname: 'Test Badge Volunteer',
      email: testVolunteerEmail,
      password: 'password123',
      role: 'Volunteer',
      location: 'Mumbai',
      bloodGroup: 'B+',
      isBloodDonor: true,
      impactScore: 0
    });
    console.log('Volunteer created:', volunteer.fullname, volunteer._id);

    const ngo = await User.create({
      fullname: 'Test Badge NGO',
      email: testNgoEmail,
      password: 'password123',
      role: 'NGO',
      location: 'Mumbai'
    });
    console.log('NGO created:', ngo.fullname, ngo._id);

    // 2. Seed 5 Opportunities (Needed for 5-applications badge test)
    console.log('\n--- 2. Creating 5 Test Opportunities ---');
    const opportunities = [];
    for (let i = 1; i <= 5; i++) {
      const opp = await SkillOpportunity.create({
        title: `Opportunity ${i}`,
        description: `This is test opportunity number ${i}`,
        category: 'Education',
        ngo: ngo._id,
        location: 'Mumbai',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      });
      opportunities.push(opp);
    }
    console.log('Opportunities created:', opportunities.length);

    // 3. Apply to first 4 opportunities
    console.log('\n--- 3. Submitting 4 Applications (Expected: No Badges Yet) ---');
    for (let i = 0; i < 4; i++) {
      const req = {
        params: { id: opportunities[i]._id.toString() },
        user: { id: volunteer._id.toString() }
      };
      const res = makeMockRes();
      await applyOpportunity(req, res);
      if (res.statusCode !== 201) {
        throw new Error(`Failed to apply to opportunity ${i + 1}. Code: ${res.statusCode}, Message: ${JSON.stringify(res.jsonData)}`);
      }
    }
    
    // Check profile - should have 0 badges
    let meReq = { user: { id: volunteer._id.toString() } };
    let meRes = makeMockRes();
    await getMe(meReq, meRes);
    console.log('Badges count after 4 applications (Expected: 0):', meRes.jsonData.data.badges.length);
    if (meRes.jsonData.data.badges.length !== 0) {
      throw new Error(`Expected 0 badges, but found ${meRes.jsonData.data.badges.length}`);
    }

    // 4. Submit the 5th application
    console.log('\n--- 4. Submitting 5th Application (Expected: "5 Applications" Badge Unlocked) ---');
    const req5 = {
      params: { id: opportunities[4]._id.toString() },
      user: { id: volunteer._id.toString() }
    };
    const res5 = makeMockRes();
    await applyOpportunity(req5, res5);
    if (res5.statusCode !== 201) {
      throw new Error(`Failed to apply to 5th opportunity. Code: ${res5.statusCode}`);
    }

    // Check profile again - should have 1 badge: '5 Applications'
    meRes = makeMockRes();
    await getMe(meReq, meRes);
    console.log('Badges list after 5th application:', meRes.jsonData.data.badges);
    if (meRes.jsonData.data.badges.length !== 1 || meRes.jsonData.data.badges[0].title !== '5 Applications') {
      throw new Error(`Expected '5 Applications' badge to be unlocked, but badges list is: ${JSON.stringify(meRes.jsonData.data.badges)}`);
    }
    console.log('SUCCESS: "5 Applications" badge awarded and populated successfully!');

    // 5. NGO accepts the 1st application
    console.log('\n--- 5. Accepting 1st Application (Expected: "First Contribution" Badge Unlocked) ---');
    // Find volunteer's application for opportunity 1
    const appDoc = await Application.findOne({
      opportunity: opportunities[0]._id,
      applicant: volunteer._id
    });
    
    const updateReq = {
      params: { id: appDoc._id.toString() },
      body: { status: 'accepted' },
      user: { id: ngo._id.toString(), fullname: ngo.fullname }
    };
    const updateRes = makeMockRes();
    await updateApplicationStatus(updateReq, updateRes);
    if (updateRes.statusCode !== 200) {
      throw new Error(`Failed to accept application. Code: ${updateRes.statusCode}, Message: ${JSON.stringify(updateRes.jsonData)}`);
    }

    // Check profile again - should have 2 badges: '5 Applications', 'First Contribution'
    meRes = makeMockRes();
    await getMe(meReq, meRes);
    console.log('Badges list after application acceptance:', meRes.jsonData.data.badges);
    const badgeTitles = meRes.jsonData.data.badges.map(b => b.title);
    if (!badgeTitles.includes('First Contribution')) {
      throw new Error(`Expected 'First Contribution' badge to be unlocked, but badges list contains: ${JSON.stringify(badgeTitles)}`);
    }
    console.log('SUCCESS: "First Contribution" badge awarded and populated successfully!');

    // 6. Respond to Blood Request
    console.log('\n--- 6. Responding to Blood Request (Expected: "First Blood Donation" Badge Unlocked) ---');
    // NGO creates blood request
    const bloodReqDoc = await BloodRequest.create({
      requester: ngo._id,
      postedBy: ngo._id,
      patientName: 'Aarav Sharma',
      bloodGroup: 'B+',
      unitsNeeded: 1,
      hospital: 'Lilavati Hospital',
      city: 'Mumbai',
      location: 'Bandra, Mumbai',
      contactNumber: '+91 99999 77777',
      urgency: 'high',
      status: 'pending'
    });

    const respondReq = {
      params: { id: bloodReqDoc._id.toString() },
      user: { id: volunteer._id.toString() }
    };
    const respondRes = makeMockRes();
    await respondToRequest(respondReq, respondRes);
    if (respondRes.statusCode !== 200) {
      throw new Error(`Failed to respond to blood request. Code: ${respondRes.statusCode}, Message: ${JSON.stringify(respondRes.jsonData)}`);
    }

    // Check profile/getUserProfile to verify all 3 badges
    const profileReq = { user: { id: volunteer._id.toString() } };
    const profileRes = makeMockRes();
    await getUserProfile(profileReq, profileRes);
    console.log('Badges list after blood donation response:', profileRes.jsonData.data.badges);
    
    const finalBadgeTitles = profileRes.jsonData.data.badges.map(b => b.title);
    if (!finalBadgeTitles.includes('First Blood Donation')) {
      throw new Error(`Expected 'First Blood Donation' badge to be unlocked, but final badges list is: ${JSON.stringify(finalBadgeTitles)}`);
    }

    if (finalBadgeTitles.length === 3) {
      console.log('\nSUCCESS: All 3 badges ("5 Applications", "First Contribution", "First Blood Donation") were successfully awarded, saved, populated, and retrieved!');
    } else {
      throw new Error(`Expected exactly 3 badges, but got ${finalBadgeTitles.length}: ${JSON.stringify(finalBadgeTitles)}`);
    }

  } catch (error) {
    console.error('\nERROR: Test execution failed!');
    console.error(error);
  } finally {
    // Cleanup test data
    console.log('\nCleaning up database records...');
    const existingVolunteer = await User.findOne({ email: testVolunteerEmail });
    const existingNgo = await User.findOne({ email: testNgoEmail });

    if (existingVolunteer) {
      await UserBadge.deleteMany({ user: existingVolunteer._id });
      await Application.deleteMany({ applicant: existingVolunteer._id });
      await BloodRequest.deleteMany({ 'responses.donor': existingVolunteer._id });
      await Notification.deleteMany({ user: existingVolunteer._id });
      await User.deleteOne({ _id: existingVolunteer._id });
    }
    if (existingNgo) {
      await SkillOpportunity.deleteMany({ ngo: existingNgo._id });
      await BloodRequest.deleteMany({ requester: existingNgo._id });
      await User.deleteOne({ _id: existingNgo._id });
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runTests();
