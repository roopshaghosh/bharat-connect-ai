const axios = require('axios');
const User = require('../models/User');
const SkillOpportunity = require('../models/SkillOpportunity');
const BloodRequest = require('../models/BloodRequest');

// High quality fallback mock responses for when API key is missing or request fails
const fallbackGenerate = (promptText) => {
  const lower = promptText.toLowerCase();
  
  if (lower.includes('teach') || lower.includes('children') || lower.includes('education') || lower.includes('school') || lower.includes('study')) {
    return {
      title: "Volunteer Educator for Underprivileged Children",
      description: "Join our community-driven campaign to support children from under-resourced families with study guidance, mentoring, and academic activities.",
      requirements: [
        "Patience, empathy, and positive reinforcement skills",
        "Basic teaching proficiency in math, science, or language subjects",
        "Ability to commit at least 2 to 4 hours per week",
        "Prior experience working with youth is a major plus"
      ],
      responsibilities: [
        "Plan and lead interactive learning sessions for a group of 5-10 children",
        "Help students resolve complex homework questions and textbook topics",
        "Organize recreational games, art sessions, or educational quizzes",
        "Offer mentorship and motivate children to stay in school"
      ]
    };
  } else if (lower.includes('blood') || lower.includes('donor') || lower.includes('health') || lower.includes('medical') || lower.includes('camp')) {
    return {
      title: "Medical Camp Coordinator & Healthcare Volunteer",
      description: "Empower local communities by coordinating and managing logistics at our upcoming healthcare and blood donation awareness camps.",
      requirements: [
        "Strong administrative, organizational, and delegation skills",
        "Effective communication skills with local residents and visiting doctors",
        "Basic training in first aid or healthcare is appreciated but not mandatory",
        "Ability to coordinate on-site checkins and maintain list hygiene"
      ],
      responsibilities: [
        "Help set up clinical counters, check-in desks, and refreshment stations",
        "Register patients and donors, checking their queue slips",
        "Manage supply inventory and maintain strict hygiene norms",
        "Distribute informative flyers on preventive care and blood donation"
      ]
    };
  } else {
    // Generic fallback for any other volunteer campaign prompt
    return {
      title: `Community Volunteer Driver for "${promptText}"`,
      description: `Support our team to run local campaigns focusing on "${promptText}". We are scaling our outreach and require proactive coordinators.`,
      requirements: [
        "Dedication to social development and community empowerment",
        "Excellent group communication skills and helpful behavior",
        "Willingness to travel locally and coordinate on the ground",
        "Collaborative mindset and capability to handle unexpected bottlenecks"
      ],
      responsibilities: [
        "Participate in physical meets, community surveys, or task forces",
        "Collect and log feedback from local citizens for future drives",
        "Distribute utility resources, booklets, or food items",
        "Coordinate with NGO leads to organize volunteer schedules"
      ]
    };
  }
};

// @desc    Generate volunteer opportunity content using Gemini API
// @route   POST /api/ai/generate-opportunity
// @access  Private (NGO only/Authenticated user)
const generateOpportunity = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a prompt describing the volunteer requirement',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.warn('AI GENERATION WARNING: Gemini API Key not configured. Using high-quality mock fallback.');
      const data = fallbackGenerate(prompt);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback',
        data,
      });
    }

    try {
      console.log(`Querying Gemini API for prompt: "${prompt}"`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an AI opportunity generator assistant for an NGO application called "Bharat Connect".
Generate a volunteer opportunity based on this requirement: "${prompt}".
You MUST return a JSON object with EXACTLY the following keys:
- title (String): A compelling, catchy title for the volunteer event.
- description (String): A short, professional paragraph explaining the drive's background and purpose.
- requirements (Array of Strings): 3 to 4 specific volunteer skill or time commitments required.
- responsibilities (Array of Strings): 3 to 4 key tasks the volunteer will carry out.

Return ONLY the raw JSON string matching this structure. Do not include markdown tags like \`\`\`json or \`\`\`.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10s timeout
      });

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Invalid or empty response from Gemini API');
      }

      // Parse JSON from Gemini
      let cleanedText = responseText.trim();
      // Remove any accidental markdown backticks just in case
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }

      const generatedData = JSON.parse(cleanedText);

      return res.status(200).json({
        success: true,
        source: 'gemini_api',
        data: {
          title: generatedData.title || `Volunteer campaign for ${prompt}`,
          description: generatedData.description || `Help us coordinate our project for ${prompt}`,
          requirements: Array.isArray(generatedData.requirements) ? generatedData.requirements : [],
          responsibilities: Array.isArray(generatedData.responsibilities) ? generatedData.responsibilities : [],
        },
      });
    } catch (apiError) {
      console.error('Gemini API request failed, falling back to mock generator:', apiError.message);
      const data = fallbackGenerate(prompt);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback_on_error',
        data,
      });
    }
  } catch (error) {
    console.error('AI Opportunity Generation General Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const fallbackRecommendations = (user, opportunities, bloodRequests) => {
  const volunteerMatches = [];
  const bloodMatches = [];

  // 1. Match Volunteer Opportunities
  opportunities.forEach(opp => {
    let score = 0;
    const reasons = [];

    // Location match
    if (user.location && opp.location && user.location.toLowerCase().trim() === opp.location.toLowerCase().trim()) {
      score += 40;
      reasons.push("Located in your city");
    }

    // Skills overlap
    if (user.skills && user.skills.length > 0 && opp.skillsRequired && opp.skillsRequired.length > 0) {
      const skillsOverlap = opp.skillsRequired.filter(s => user.skills.some(us => us.toLowerCase() === s.toLowerCase()));
      if (skillsOverlap.length > 0) {
        score += Math.min(skillsOverlap.length * 20, 40);
        reasons.push(`Matches your skills: ${skillsOverlap.join(', ')}`);
      }
    }

    // Category match
    if (user.interests && user.interests.length > 0 && opp.category) {
      const interestMatch = user.interests.some(i => i.toLowerCase() === opp.category.toLowerCase());
      if (interestMatch) {
        score += 20;
        reasons.push(`Matches your interest in ${opp.category}`);
      }
    }

    if (score >= 30) {
      volunteerMatches.push({
        opportunityId: opp._id.toString(),
        matchPercentage: Math.min(score, 100),
        reason: reasons.join(', ') || "Matched category or location tags."
      });
    }
  });

  // Sort volunteer matches by percentage descending
  volunteerMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // 2. Match Blood Requests (only if user is willing donor and has set blood group)
  if (user.isBloodDonor && user.bloodGroup && user.bloodGroup !== 'Unknown') {
    bloodRequests.forEach(req => {
      let score = 0;
      const reasons = [];

      const targetBg = req.bloodGroup;
      const donorBg = user.bloodGroup;

      let isCompatible = false;
      if (targetBg === donorBg) {
        isCompatible = true;
        score += 60;
        reasons.push(`Exact blood group match (${donorBg})`);
      } else if (donorBg === 'O-') {
        isCompatible = true; // Universal donor
        score += 40;
        reasons.push("Universal donor O- compatibility");
      }

      // Location match
      if (isCompatible && user.location && req.city && user.location.toLowerCase().trim() === req.city.toLowerCase().trim()) {
        score += 40;
        reasons.push("Critical need near your location");
      }

      if (isCompatible) {
        bloodMatches.push({
          requestId: req._id.toString(),
          matchPercentage: Math.min(score, 100),
          reason: reasons.join(' & ') || "Compatible blood type request."
        });
      }
    });
  }

  // Sort blood matches
  bloodMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

  let profileAnalysis = `Based on your profile tags (${user.skills?.slice(0, 3).join(', ') || 'no skills registered'}) and location (${user.location || 'Mumbai'}), we found ${volunteerMatches.length} volunteering opportunities and ${bloodMatches.length} critical blood requests compatible with your expertise.`;
  if (volunteerMatches.length > 0) {
    const matchedOpp = opportunities.find(o => o._id.toString() === volunteerMatches[0].opportunityId);
    if (matchedOpp) {
      profileAnalysis += ` We highly recommend looking at "${matchedOpp.title}" which matches your skills.`;
    }
  }

  return {
    profileAnalysis,
    volunteerMatches,
    bloodMatches
  };
};

// @desc    Get personalized matches and recommendations using AI
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const opportunities = await SkillOpportunity.find({});
    const bloodRequests = await BloodRequest.find({ status: 'pending' });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.warn('AI MATCHING WARNING: Gemini API Key not configured. Using high-quality local matching fallback.');
      const data = fallbackRecommendations(user, opportunities, bloodRequests);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback',
        data,
      });
    }

    try {
      console.log(`Querying Gemini API for recommendations for user ${user._id}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const formattedOpps = opportunities.map(o => ({
        id: o._id.toString(),
        title: o.title,
        category: o.category,
        skillsRequired: o.skillsRequired,
        location: o.location
      }));

      const formattedBlood = bloodRequests.map(r => ({
        id: r._id.toString(),
        bloodGroup: r.bloodGroup,
        city: r.city,
        hospital: r.hospital
      }));

      const systemInstruction = `You are the AI Matcher for the "Bharat Connect" social impact platform.
Analyze the user profile details and match them with active volunteer opportunities and emergency blood requests.
Format your output as a raw JSON object matching the following structure:
{
  "profileAnalysis": "A short 1-2 sentence overview explaining the user's overall match and recommending the highest percentage volunteer drive.",
  "volunteerMatches": [
    {
      "opportunityId": "String representing opportunity ID",
      "matchPercentage": 90,
      "reason": "Clear explanation of the skill, location, or interest match."
    }
  ],
  "bloodMatches": [
    {
      "requestId": "String representing blood request ID",
      "matchPercentage": 85,
      "reason": "Explanation of blood type match and location proximity."
    }
  ]
}

=== USER PROFILE ===
- Location: ${user.location}
- Blood Group: ${user.bloodGroup}
- Willing Blood Donor: ${user.isBloodDonor}
- Skills: ${user.skills?.join(', ') || 'None'}
- Interests: ${user.interests?.join(', ') || 'None'}

=== VOLUNTEER OPPORTUNITIES ===
${JSON.stringify(formattedOpps)}

=== BLOOD REQUESTS ===
${JSON.stringify(formattedBlood)}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: systemInstruction
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini API');
      }

      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }

      const generatedData = JSON.parse(cleanedText);

      return res.status(200).json({
        success: true,
        source: 'gemini_api',
        data: generatedData,
      });
    } catch (apiError) {
      console.error('Gemini API recommendations failed, using local fallback:', apiError.message);
      const data = fallbackRecommendations(user, opportunities, bloodRequests);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback_on_error',
        data,
      });
    }
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateOpportunity,
  getRecommendations,
};
