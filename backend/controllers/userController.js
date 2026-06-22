const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const BloodDonor = require('../models/BloodDonor');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch and populate user badges
    const userBadges = await UserBadge.find({ user: req.user.id }).populate('badge');
    const badgeList = userBadges.filter(ub => ub.badge).map(ub => ({
      title: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon || '🏆'
    }));

    const userData = user.toObject();
    userData.name = userData.fullname;
    if (userData.role === 'Volunteer') userData.role = 'user';
    else if (userData.role === 'NGO') userData.role = 'organization';

    res.status(200).json({
      success: true,
      data: {
        ...userData,
        badges: badgeList
      },
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Updatable fields
    const { fullname, name, location, bio, skills, interests, availability, bloodGroup, isBloodDonor } = req.body;

    const actualFullname = fullname !== undefined ? fullname : name;
    if (actualFullname !== undefined) user.fullname = actualFullname;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (availability !== undefined) user.availability = availability;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (isBloodDonor !== undefined) user.isBloodDonor = isBloodDonor;

    // Handle skills and interests arrays
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) 
        ? interests 
        : interests.split(',').map(i => i.trim()).filter(Boolean);
    }

    const updatedUser = await user.save();

    // Sync with BloodDonor model if user is a volunteer
    if (updatedUser.role === 'Volunteer') {
      const donorCity = location || updatedUser.location || 'Unknown';
      const donorBloodGroup = bloodGroup || updatedUser.bloodGroup || 'Unknown';
      const donorAvailable = isBloodDonor !== undefined ? isBloodDonor : updatedUser.isBloodDonor;

      if (donorBloodGroup !== 'Unknown') {
        let donor = await BloodDonor.findOne({ user: updatedUser._id });
        if (donor) {
          donor.bloodGroup = donorBloodGroup;
          donor.city = donorCity;
          donor.available = donorAvailable;
          await donor.save();
        } else {
          await BloodDonor.create({
            user: updatedUser._id,
            bloodGroup: donorBloodGroup,
            city: donorCity,
            available: donorAvailable,
          });
        }
      }
    }

    // Fetch and populate user badges
    const userBadges = await UserBadge.find({ user: req.user.id }).populate('badge');
    const badgeList = userBadges.filter(ub => ub.badge).map(ub => ({
      title: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon || '🏆'
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        name: updatedUser.fullname,
        email: updatedUser.email,
        role: updatedUser.role === 'Volunteer' ? 'user' : 'organization',
        location: updatedUser.location,
        bloodGroup: updatedUser.bloodGroup,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        availability: updatedUser.availability,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        badges: badgeList,
      },
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
