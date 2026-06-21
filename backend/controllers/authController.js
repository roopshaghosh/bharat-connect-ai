const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Application = require('../models/Application');
const SkillOpportunity = require('../models/SkillOpportunity');
const BloodRequest = require('../models/BloodRequest');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecretkeyforbharatconnectbackendjwt',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullname, email, password, role, location, bloodGroup } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      fullname,
      email,
      password,
      role,
      location,
      bloodGroup,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          location: user.location,
          bloodGroup: user.bloodGroup,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        location: user.location,
        bloodGroup: user.bloodGroup,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Google Login / Registration
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken, role, location, bloodGroup } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Google idToken',
      });
    }

    let googlePayload;
    try {
      // Verify Google ID Token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google ID Token verification failed:', verifyError);
      return res.status(400).json({
        success: false,
        message: 'Google ID Token verification failed. Ensure GOOGLE_CLIENT_ID is set correctly.',
      });
    }

    const { sub: googleId, email, name: fullname, picture: avatar } = googlePayload;

    // Check if user already has this googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // If not, check if user exists with the same email
      user = await User.findOne({ email });

      if (user) {
        // Link Google ID to existing account
        user.googleId = googleId;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        // Create new account via Google Login
        // Note: For registration, we require role and location selection from the frontend client.
        if (!role || !location) {
          return res.status(400).json({
            success: false,
            message: 'First-time Google Sign-In requires selecting a Role (Volunteer/NGO) and providing Location',
            registrationRequired: true,
            email,
            fullname,
          });
        }

        user = await User.create({
          fullname,
          email,
          role,
          location,
          bloodGroup,
          googleId,
          avatar,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        location: user.location,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get impact stats for current user
// @route   GET /api/auth/impact
// @access  Private
const getImpactStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isOrg = req.user.role === 'NGO';

    let stats = {
      impactScore: req.user.impactScore || 0,
      volunteerHoursEstimated: 0,
      totalApplications: 0,
      approvedApplications: 0
    };

    if (isOrg) {
      // NGO: stats for opportunities they created
      const opportunities = await SkillOpportunity.find({ ngo: userId });
      const oppIds = opportunities.map(o => o._id);
      
      stats.totalApplications = await Application.countDocuments({ opportunity: { $in: oppIds } });
      stats.approvedApplications = await Application.countDocuments({ opportunity: { $in: oppIds }, status: 'accepted' });
      stats.volunteerHoursEstimated = stats.approvedApplications * 4; // estimate 4 hours per approval
    } else {
      // Volunteer: stats for applications they submitted
      stats.totalApplications = await Application.countDocuments({ applicant: userId });
      stats.approvedApplications = await Application.countDocuments({ applicant: userId, status: 'accepted' });
      stats.volunteerHoursEstimated = stats.approvedApplications * 4;
    }

    // Add points for blood responses if any
    const bloodResponsesCount = await BloodRequest.countDocuments({
      'responses.donor': userId
    });
    
    // Dynamic impactScore = (approvedApplications * 50) + (bloodResponsesCount * 30)
    stats.impactScore = (stats.approvedApplications * 50) + (bloodResponsesCount * 30);

    // Persist updated impactScore to user object
    if (req.user.impactScore !== stats.impactScore) {
      req.user.impactScore = stats.impactScore;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get Impact Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  getImpactStats,
};
