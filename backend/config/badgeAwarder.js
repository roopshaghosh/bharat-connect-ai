const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Application = require('../models/Application');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const { emitToUser } = require('./socket');

// Seed master badges list if missing
const initializeBadges = async () => {
  try {
    const masterBadges = [
      {
        name: 'First Contribution',
        description: 'Awarded for your first accepted volunteer application or first blood donation offer.',
        icon: '🤝'
      },
      {
        name: 'First Blood Donation',
        description: 'Awarded for responding to your first emergency blood request.',
        icon: '❤️'
      },
      {
        name: '5 Applications',
        description: 'Awarded for submitting 5 volunteer applications on the platform.',
        icon: '🔥'
      }
    ];

    for (const b of masterBadges) {
      const exists = await Badge.findOne({ name: b.name });
      if (!exists) {
        await Badge.create(b);
        console.log(`Initialized Master Badge: ${b.name}`);
      }
    }
  } catch (error) {
    console.error('Initialize Badges Error:', error);
  }
};

// Check and award badges to a user
const checkAndAwardBadges = async (userId) => {
  try {
    if (!userId) return;

    // 1. Fetch master badges
    const firstContribBadge = await Badge.findOne({ name: 'First Contribution' });
    const firstBloodBadge = await Badge.findOne({ name: 'First Blood Donation' });
    const fiveAppsBadge = await Badge.findOne({ name: '5 Applications' });

    // 2. Fetch user's currently earned badges
    const earnedUserBadges = await UserBadge.find({ user: userId });
    const earnedBadgeIds = earnedUserBadges.map(ub => ub.badge.toString());

    // 3. Helper to create UserBadge, Notification, and emit Socket alert
    const awardBadge = async (badgeDoc) => {
      if (!badgeDoc || earnedBadgeIds.includes(badgeDoc._id.toString())) return;

      try {
        await UserBadge.create({
          user: userId,
          badge: badgeDoc._id
        });

        // Create Alert Notification
        const notification = await Notification.create({
          user: userId,
          title: 'New Badge Unlocked! 🏆',
          message: `Congratulations! You unlocked the "${badgeDoc.name}" badge: ${badgeDoc.description}`,
          read: false
        });

        // Real-time emit to volunteer
        emitToUser(userId, 'notification', notification);
        console.log(`Awarded badge "${badgeDoc.name}" to user ${userId}`);
      } catch (err) {
        // Handle concurrent/race-condition unique key index error gracefully
        if (err.code !== 11000) {
          console.error(`Error awarding badge ${badgeDoc.name}:`, err);
        }
      }
    };

    // --- Check Badge 1: First Contribution ---
    // Criteria: At least one accepted application OR at least one blood request response
    const acceptedAppsCount = await Application.countDocuments({ applicant: userId, status: 'accepted' });
    const bloodOffersCount = await BloodRequest.countDocuments({ 'responses.donor': userId });

    if (acceptedAppsCount > 0 || bloodOffersCount > 0) {
      await awardBadge(firstContribBadge);
    }

    // --- Check Check 2: First Blood Donation ---
    // Criteria: At least one blood request response
    if (bloodOffersCount > 0) {
      await awardBadge(firstBloodBadge);
    }

    // --- Check Badge 3: 5 Applications ---
    // Criteria: Total applications submitted >= 5
    const totalAppsCount = await Application.countDocuments({ applicant: userId });
    if (totalAppsCount >= 5) {
      await awardBadge(fiveAppsBadge);
    }

  } catch (error) {
    console.error('Check and Award Badges Error:', error);
  }
};

module.exports = {
  initializeBadges,
  checkAndAwardBadges,
};
