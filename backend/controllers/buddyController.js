const axios = require('axios');
const User = require('../models/User');
const SkillOpportunity = require('../models/SkillOpportunity');

// Local fallback chatbot generator for when API key is missing or request fails
const fallbackChat = (message, user, opportunities) => {
  const msgLower = message.toLowerCase();
  
  // Find matching opportunities in the database based on message or user skills
  const matchedOpps = [];
  opportunities.forEach(opp => {
    let matches = false;
    
    // Check if the opportunity title or description mentions keywords in the user's message
    const titleLower = opp.title.toLowerCase();
    const descLower = opp.description.toLowerCase();
    const skillsLower = opp.skillsRequired.map(s => s.toLowerCase());
    
    // Scan keywords from message
    const keywords = msgLower.split(/[\s,?.!]+/).filter(w => w.length > 3);
    for (const word of keywords) {
      if (titleLower.includes(word) || descLower.includes(word) || skillsLower.includes(word)) {
        matches = true;
        break;
      }
    }

    // Also check if it matches user's skills
    if (user.skills && user.skills.length > 0) {
      const userSkillsLower = user.skills.map(s => s.toLowerCase());
      if (skillsLower.some(s => userSkillsLower.includes(s))) {
        matches = true;
      }
    }

    if (matches) {
      matchedOpps.push(opp);
    }
  });

  // Construct response text
  let responseText = `Namaste ${user.fullname}! 🙏 I am your **Bharat Buddy** assistant.\n\n`;

  if (msgLower.includes('flutter') || msgLower.includes('mobile') || msgLower.includes('app')) {
    responseText += `It's great that you know **Flutter** and mobile app development! Technical skills are highly valued by NGOs looking to build digital tools for social good.\n\n`;
    
    if (matchedOpps.length > 0) {
      responseText += `Based on our database, here are some opportunities you should check out:\n`;
      matchedOpps.forEach(opp => {
        responseText += `- **${opp.title}** at *${opp.location}* (Requires: ${opp.skillsRequired.join(', ')})\n  *Description:* ${opp.description.slice(0, 120)}...\n\n`;
      });
    } else {
      responseText += `I couldn't find any active Flutter-specific listings right now, but you can create a customized volunteer drive under your profile or check the Volunteer Hub periodically. You might also want to look into virtual tutoring or general IT volunteer positions!\n\n`;
    }
    
    responseText += `Since you have weekends free, most drives schedule their volunteer shifts on Saturday and Sunday. Be sure to check the dates on our platform!`;
  } else if (msgLower.includes('teach') || msgLower.includes('children') || msgLower.includes('study') || msgLower.includes('education')) {
    responseText += `Teaching is one of the most rewarding ways to contribute. Underprivileged children are always in need of guidance and mentorship!\n\n`;
    
    // Filter opportunities by category or title
    const teachingOpps = opportunities.filter(opp => 
      opp.category?.toLowerCase() === 'education' || 
      opp.title.toLowerCase().includes('teach') || 
      opp.title.toLowerCase().includes('educat')
    );

    if (teachingOpps.length > 0) {
      responseText += `Here are education-related opportunities currently active in the database:\n`;
      teachingOpps.forEach(opp => {
        responseText += `- **${opp.title}** at *${opp.location}* (Category: ${opp.category})\n  *Details:* ${opp.description.slice(0, 120)}...\n\n`;
      });
    } else {
      responseText += `We don't have active education listings at this moment. You can propose a new educational campaign or help local NGO centers with administrative and tech setups!\n\n`;
    }
  } else {
    // Generic response based on user profile and available opportunities
    responseText += `Thank you for reaching out! Let me check your profile and the available opportunities for you.\n\n`;
    responseText += `**Your Profile Details:**\n`;
    responseText += `- **Location:** ${user.location || 'Not set'}\n`;
    responseText += `- **Skills:** ${user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Not registered yet'}\n`;
    responseText += `- **Interests:** ${user.interests && user.interests.length > 0 ? user.interests.join(', ') : 'Not registered yet'}\n\n`;

    if (matchedOpps.length > 0) {
      responseText += `I found these opportunities matching your profile interests or skills:\n`;
      matchedOpps.slice(0, 3).forEach(opp => {
        responseText += `- **${opp.title}** (${opp.category}) - *${opp.location}*\n  *Skills needed:* ${opp.skillsRequired.join(', ')}\n\n`;
      });
    } else if (opportunities.length > 0) {
      responseText += `I don't see direct profile matches, but here are some of our general active opportunities:\n`;
      opportunities.slice(0, 2).forEach(opp => {
        responseText += `- **${opp.title}** at *${opp.location}*\n`;
      });
    } else {
      responseText += `Our opportunities list is currently empty. Feel free to explore the Blood Network or edit your profile skills to get matches when new events are posted!`;
    }
  }

  return responseText;
};

// @desc    Chat with the AI Assistant (Bharat Buddy)
// @route   POST /api/buddy/chat
// @access  Private
const chatWithBuddy = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for Bharat Buddy',
      });
    }

    // 1. Fetch User Profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // 2. Fetch Active Opportunities
    const opportunities = await SkillOpportunity.find({}).sort({ createdAt: -1 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.warn('BHARAT BUDDY WARNING: Gemini API Key not configured. Using local fallback chatbot logic.');
      const reply = fallbackChat(message, user, opportunities);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback',
        reply,
      });
    }

    try {
      console.log(`Querying Gemini API for Bharat Buddy chat: "${message}"`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Format available opportunities for prompt context
      const formattedOpps = opportunities.map((opp, idx) => {
        return `${idx + 1}. Title: ${opp.title}
   Category: ${opp.category}
   Location: ${opp.location}
   Deadline: ${opp.deadline ? new Date(opp.deadline).toDateString() : 'N/A'}
   Skills Required: ${opp.skillsRequired.join(', ')}
   Description: ${opp.description}`;
      }).join('\n\n');

      const systemInstruction = `You are "Bharat Buddy", an intelligent, warm, and empathetic AI assistant for the "Bharat Connect" social impact and volunteering platform. 
Your goal is to guide volunteers, recommend matching opportunities from the database, and answer questions.
Keep your tone encouraging, helpful, and culturally friendly in an Indian context. Use formatting like bullet points, bold text, and emojis where appropriate to make your response highly readable.

Here is the context you MUST use to personalize your response:
=== USER PROFILE ===
- Name: ${user.fullname}
- Role: ${user.role}
- Location: ${user.location}
- Registered Skills: ${user.skills ? user.skills.join(', ') : 'None'}
- Registered Interests: ${user.interests ? user.interests.join(', ') : 'None'}
- User Bio: ${user.bio || 'Not provided'}
- Availability: ${user.availability || 'Not provided'}

=== AVAILABLE OPPORTUNITIES IN DATABASE ===
${formattedOpps || 'No opportunities are currently active in the database.'}

=== INSTRUCTIONS ===
1. Analyze if any available opportunities match the user's message, skills, interests, location, or availability.
2. Recommend the best matching opportunities with their title and location.
3. If no opportunities match or the database is empty, give general guidance on how they can contribute or what skills they could add.
4. Reply directly to the user's query.`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nUser Query: "${message}"\n\nBharat Buddy Reply:`,
              },
            ],
          },
        ],
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      });

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('Empty response received from Gemini API');
      }

      return res.status(200).json({
        success: true,
        source: 'gemini_api',
        reply: responseText.trim(),
      });
    } catch (apiError) {
      console.error('Gemini API call failed for Bharat Buddy, using local fallback:', apiError.message);
      const reply = fallbackChat(message, user, opportunities);
      return res.status(200).json({
        success: true,
        source: 'mock_fallback_on_error',
        reply,
      });
    }
  } catch (error) {
    console.error('Bharat Buddy Chat Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatWithBuddy,
};
