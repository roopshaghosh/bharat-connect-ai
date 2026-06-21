const BloodDonor = require('../models/BloodDonor');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

// @desc    Register or update availability as a blood donor
// @route   POST /api/blood/donor
// @access  Private
const becomeDonor = async (req, res) => {
  try {
    const { bloodGroup, city, available } = req.body;

    if (!bloodGroup || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blood group and city',
      });
    }

    const isAvailable = available !== undefined ? available : true;

    // Check if donor profile already exists for this user
    let donor = await BloodDonor.findOne({ user: req.user.id });

    if (donor) {
      donor.bloodGroup = bloodGroup;
      donor.city = city;
      donor.available = isAvailable;
      await donor.save();
    } else {
      donor = await BloodDonor.create({
        user: req.user.id,
        bloodGroup,
        city,
        available: isAvailable,
      });
    }

    // Keep the User profile in sync
    const user = await User.findById(req.user.id);
    if (user) {
      user.bloodGroup = bloodGroup;
      user.isBloodDonor = isAvailable;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    console.error('Become Donor Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create an emergency blood request
// @route   POST /api/blood/request or /api/blood-donation/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      city,
      location,
      contactNumber,
      urgency,
    } = req.body;

    if (!patientName || !bloodGroup || !hospital || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (patientName, bloodGroup, hospital, contactNumber)',
      });
    }

    const requestCity = city || location || 'Unknown';
    const requestLocation = location || city || 'Unknown';

    const bloodRequest = await BloodRequest.create({
      requester: req.user.id,
      postedBy: req.user.id,
      patientName,
      bloodGroup,
      unitsNeeded: unitsNeeded || 1,
      hospital,
      city: requestCity,
      location: requestLocation,
      contactNumber,
      urgency: urgency || 'medium',
      status: 'pending',
    });

    const populatedRequest = await BloodRequest.findById(bloodRequest._id)
      .populate('postedBy', 'fullname email location bloodGroup avatar')
      .populate('requester', 'fullname email location bloodGroup avatar');

    // Trigger notifications for nearby available donors in the same city
    try {
      const nearbyDonors = await BloodDonor.find({
        city: { $regex: new RegExp(`^${requestCity}$`, 'i') },
        available: true,
        user: { $ne: req.user.id }
      });

      for (const donor of nearbyDonors) {
        const notification = await Notification.create({
          user: donor.user,
          title: 'Emergency Blood Request Nearby 🚨',
          message: `A critical blood request for group ${bloodGroup} is needed at ${hospital} in ${requestCity}. Please help if you can!`,
          read: false
        });

        // Real-time emit to donor
        emitToUser(donor.user, 'notification', notification);
      }
    } catch (triggerError) {
      console.error('Trigger Blood Request Nearby Notification Error:', triggerError);
    }

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    console.error('Create Blood Request Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    View all active blood requests
// @route   GET /api/blood/requests or /api/blood-donation/requests
// @access  Public
const getRequests = async (req, res) => {
  try {
    const { bloodGroup, location, city } = req.query;
    let query = {};

    // Filter by bloodGroup (case insensitive/exact depending on input)
    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    // Filter by location or city (case-insensitive regex search)
    const place = location || city;
    if (place) {
      query.$or = [
        { city: { $regex: place, $options: 'i' } },
        { location: { $regex: place, $options: 'i' } },
      ];
    }

    const requests = await BloodRequest.find(query)
      .populate('postedBy', 'fullname email location bloodGroup avatar')
      .populate('requester', 'fullname email location bloodGroup avatar')
      .populate('responses.donor', 'fullname email location bloodGroup avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Respond to an emergency blood request
// @route   POST /api/blood-donation/requests/:id/respond
// @access  Private
const respondToRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Requesters shouldn't respond to their own request
    if (request.postedBy.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot respond to your own blood request',
      });
    }

    // Check if user already responded
    const alreadyResponded = request.responses.some(
      (r) => r.donor.toString() === req.user.id
    );

    if (alreadyResponded) {
      return res.status(400).json({
        success: false,
        message: 'You have already offered to donate for this request',
      });
    }

    // Register donor offer
    request.responses.push({ donor: req.user.id });
    await request.save();

    // Reward donor with +30 XP (impactScore)
    const donorUser = await User.findById(req.user.id);
    if (donorUser) {
      donorUser.impactScore = (donorUser.impactScore || 0) + 30;
      await donorUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Donation offer registered successfully. Thank you for your support!',
    });
  } catch (error) {
    console.error('Respond to Request Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update blood request status (e.g. fulfill)
// @route   PUT /api/blood-donation/requests/:id
// @access  Private (Owner only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'fulfilled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: pending or fulfilled',
      });
    }

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Make sure user is the requester/owner
    if (request.postedBy.toString() !== req.user.id && request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this request',
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Update Request Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  becomeDonor,
  createRequest,
  getRequests,
  respondToRequest,
  updateRequestStatus,
};
