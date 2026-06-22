const Application = require('../models/Application');
const SkillOpportunity = require('../models/SkillOpportunity');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');
const { checkAndAwardBadges } = require('../config/badgeAwarder');

// @desc    Apply for a skill opportunity
// @route   POST /api/opportunities/:id/apply
// @access  Private (Volunteer only)
const applyOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    // Check if opportunity exists
    const opportunity = await SkillOpportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Check if deadline has passed
    if (new Date(opportunity.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline for this opportunity has passed',
      });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      opportunity: opportunityId,
      applicant: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity',
      });
    }

    const { message, skillsOffered } = req.body || {};

    // Create application
    const application = await Application.create({
      opportunity: opportunityId,
      applicant: req.user.id,
      message: message || '',
      skillsOffered: skillsOffered || [],
      status: 'pending',
    });

    // Check badges for the applicant
    await checkAndAwardBadges(req.user.id);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Apply Opportunity Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get applicants for a specific opportunity
// @route   GET /api/opportunities/:id/applicants
// @access  Private (NGO owner only)
const getOpportunityApplicants = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    const opportunity = await SkillOpportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Verify ownership
    if (opportunity.ngo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this opportunity',
      });
    }

    const applicants = await Application.find({ opportunity: opportunityId })
      .populate('applicant', 'fullname email location bloodGroup bio skills interests availability avatar impactScore')
      .sort({ createdAt: -1 });

    const formattedApplicants = applicants.map(app => {
      const appObj = app.toObject();
      if (appObj.applicant) {
        appObj.volunteer = {
          _id: appObj.applicant._id,
          name: appObj.applicant.fullname,
          email: appObj.applicant.email,
          impactScore: appObj.applicant.impactScore || 0,
          avatar: appObj.applicant.avatar
        };
      }
      if (appObj.status === 'accepted') {
        appObj.status = 'approved';
      }
      return appObj;
    });

    res.status(200).json({
      success: true,
      count: formattedApplicants.length,
      data: formattedApplicants,
    });
  } catch (error) {
    console.error('Get Applicants Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Accept or Reject a volunteer application
// @route   PATCH /api/applications/:id
// @access  Private (NGO owner only)
const updateApplicationStatus = async (req, res) => {
  try {
    let { status } = req.body;

    // Map frontend 'approved' to backend 'accepted'
    if (status === 'approved') {
      status = 'accepted';
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status update: accepted or rejected',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Find the associated opportunity to check ownership
    const opportunity = await SkillOpportunity.findById(application.opportunity);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Associated opportunity not found',
      });
    }

    // Verify current NGO owns this opportunity
    if (opportunity.ngo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage applications for this opportunity',
      });
    }

    application.status = status;
    const updatedApplication = await application.save();

    // Trigger conversation creation and notification if accepted
    if (status === 'accepted') {
      try {
        // Create/Find Conversation between NGO and Volunteer
        let conversation = await Conversation.findOne({
          participants: { $all: [opportunity.ngo, application.applicant] }
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [opportunity.ngo, application.applicant]
          });
          console.log(`Created Conversation ${conversation._id} between NGO ${opportunity.ngo} and Volunteer ${application.applicant}`);
        }

        // Create Alert Notification for volunteer
        const notification = await Notification.create({
          user: application.applicant,
          title: 'Application Accepted! 🎉',
          message: `Your application for "${opportunity.title}" has been accepted by ${req.user.fullname || 'the host NGO'}.`,
          read: false
        });

        // Real-time notification emit
        emitToUser(application.applicant, 'notification', notification);

        // Check badges for the applicant (First Contribution check)
        await checkAndAwardBadges(application.applicant);
      } catch (triggerError) {
        console.error('Trigger Application Accepted Action Error:', triggerError);
      }
    }

    const appObj = updatedApplication.toObject();
    if (appObj.status === 'accepted') {
      appObj.status = 'approved';
    }

    res.status(200).json({
      success: true,
      data: appObj,
    });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get volunteer applications (for volunteer applicant or NGO)
// @route   GET /api/applications or /api/volunteer/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'NGO') {
      const opportunities = await SkillOpportunity.find({ ngo: req.user.id });
      const oppIds = opportunities.map(o => o._id);
      
      applications = await Application.find({ opportunity: { $in: oppIds } })
        .populate('opportunity')
        .populate('applicant', 'fullname email location bloodGroup bio skills interests availability avatar impactScore')
        .sort({ createdAt: -1 });
    } else {
      applications = await Application.find({ applicant: req.user.id })
        .populate('opportunity')
        .populate('applicant', 'fullname email location bloodGroup bio skills interests availability avatar impactScore')
        .sort({ createdAt: -1 });
    }

    const formattedApplications = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.applicant) {
        appObj.volunteer = {
          _id: appObj.applicant._id,
          name: appObj.applicant.fullname,
          email: appObj.applicant.email,
          impactScore: appObj.applicant.impactScore || 0,
          avatar: appObj.applicant.avatar
        };
      }
      if (appObj.opportunity && !appObj.opportunity.date) {
        appObj.opportunity.date = appObj.opportunity.deadline;
      }
      if (appObj.status === 'accepted') {
        appObj.status = 'approved';
      }
      return appObj;
    });

    res.status(200).json({
      success: true,
      count: formattedApplications.length,
      data: formattedApplications,
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  applyOpportunity,
  getOpportunityApplicants,
  updateApplicationStatus,
  getApplications,
};
