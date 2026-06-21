const axios = require('axios');

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

module.exports = {
  generateOpportunity,
};
