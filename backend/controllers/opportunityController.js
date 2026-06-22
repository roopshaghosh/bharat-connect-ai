const SkillOpportunity = require('../models/SkillOpportunity');

// @desc    Create a new skill opportunity
// @route   POST /api/opportunities
// @access  Private (NGO only)
const createOpportunity = async (req, res) => {
  try {
    const { title, description, category, skillsRequired, location, deadline, date } = req.body;

    const opportunity = await SkillOpportunity.create({
      title,
      description,
      category,
      skillsRequired: Array.isArray(skillsRequired) 
        ? skillsRequired 
        : skillsRequired ? skillsRequired.split(',').map(s => s.trim()).filter(Boolean) : [],
      ngo: req.user.id,
      location,
      deadline: deadline || date,
    });

    res.status(201).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Create Opportunity Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all skill opportunities
// @route   GET /api/opportunities
// @access  Public
const getOpportunities = async (req, res) => {
  try {
    const { search, location, category, skill } = req.query;
    let query = {};

    // 1. Text search matching title or description case-insensitively
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Filter by location case-insensitively
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // 3. Filter by category case-insensitively
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // 4. Filter by skill case-insensitively (searches inside skillsRequired array)
    if (skill) {
      query.skillsRequired = { $regex: skill, $options: 'i' };
    }

    const opportunities = await SkillOpportunity.find(query)
      .populate('ngo', 'fullname email location avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    console.error('Get Opportunities Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a skill opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (NGO owner only)
const updateOpportunity = async (req, res) => {
  try {
    let opportunity = await SkillOpportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Make sure user is the NGO owner
    if (opportunity.ngo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `User is not authorized to update this opportunity`,
      });
    }

    const { title, description, category, skillsRequired, location, deadline, date } = req.body;

    if (title !== undefined) opportunity.title = title;
    if (description !== undefined) opportunity.description = description;
    if (category !== undefined) opportunity.category = category;
    if (location !== undefined) opportunity.location = location;
    
    const actualDeadline = deadline !== undefined ? deadline : date;
    if (actualDeadline !== undefined) opportunity.deadline = actualDeadline;
    if (skillsRequired !== undefined) {
      opportunity.skillsRequired = Array.isArray(skillsRequired)
        ? skillsRequired
        : skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updatedOpportunity = await opportunity.save();

    res.status(200).json({
      success: true,
      data: updatedOpportunity,
    });
  } catch (error) {
    console.error('Update Opportunity Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a skill opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (NGO owner only)
const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await SkillOpportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Make sure user is the NGO owner
    if (opportunity.ngo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `User is not authorized to delete this opportunity`,
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity removed successfully',
    });
  } catch (error) {
    console.error('Delete Opportunity Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  updateOpportunity,
  deleteOpportunity,
};
