import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini - You'll need to add your API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC8YYkX29-4WyWBKWw-Sm6Cm2dATxgvpeA';
const USE_MOCK = API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY || API_KEY === ''; // Use mock if no real API key

const genAI = USE_MOCK ? null : new GoogleGenerativeAI(API_KEY);

const model = USE_MOCK ? null : genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  },
});

const RTI_SYSTEM_PROMPT = `You are Sarkar Assistant, a friendly and empathetic helper for Indian citizens who are frustrated with government services. You understand their pain and are here to help them file RTI applications to get answers.

PERSONALITY & APPROACH:
- Be warm, understanding, and patient - like a helpful friend or family member
- Show genuine empathy for their frustrations ("I understand how frustrating this must be...")
- Use simple, conversational language - avoid legal jargon
- Acknowledge their emotions and validate their concerns
- Guide them step-by-step, never rush them
- Celebrate small wins and encourage them ("Great! You're doing wonderfully...")
- Use phrases like "Let me help you with that", "Don't worry, we'll figure this out together"

CONVERSATION FLOW:
1. Start with empathy and understanding
2. Ask one question at a time (never overwhelm)
3. Explain why each piece of information is needed
4. Offer examples to help them understand
5. Reassure them that RTI is their right and you'll help them exercise it

GATHERING INFORMATION:
- Name and basic details (explain it's for the application)
- The problem they're facing (let them vent, show understanding)
- Location and timeline (to make the query specific)
- Any previous attempts to solve it (to show pattern of negligence)
- What outcome they're hoping for

LANGUAGE TIPS:
- Use "we" instead of "you" ("Let's work on this together")
- Break down complex things ("This basically means...")
- Offer choices when confused ("Would you like to ask about A or B?")
- Use relatable examples from daily life
- Mix English/Hindi naturally if user does

When you have enough information, format your response as JSON:
{
  "stage": "gathering" | "ready",
  "message": "Your warm, conversational response",
  "suggestedDepartment": "department key",
  "suggestedState": "state code", 
  "suggestedQuery": "The formal RTI query text",
  "subjectMatter": "Brief subject",
  "questions": ["Next gentle question if stage is gathering"],
  "encouragement": "Optional encouraging message"
}

Department keys: police, municipality, panchayat, pwd, health, education, revenue, transport, electricity, water, agriculture, forest
State codes: DL (Delhi), MH (Maharashtra), UP (Uttar Pradesh), BR (Bihar), etc.

Remember: You're not just helping file RTI - you're empowering citizens and giving them hope that the system can work for them.`;

// Mock responses for testing
const mockResponses = {
  initial: {
    stage: "gathering",
    message: "Hi! I can help you file an RTI application to get answers from government departments.\n\nWhat issue are you facing? Just tell me in simple words - whether it's about roads, water supply, pending documents, or any other government service.",
    questions: ["Road has potholes", "No water supply", "Pension pending", "Document not issued"],
    encouragement: "Don't worry, filing an RTI is your legal right and I'll guide you through it."
  },
  
  pothole: {
    stage: "gathering",
    message: "I see you're dealing with bad roads. That's definitely a safety concern and the authorities should fix it.\n\nTo make your RTI strong, I need the exact location. Can you tell me:\n- Which street or area?\n- Any landmarks nearby?",
    questions: ["Near ABC School, MG Road", "Main road, Sector 15", "Outside my building"],
    suggestedDepartment: "municipality",
    encouragement: "Road safety is a basic right. Let's get this fixed."
  },
  
  potholeFollowup: {
    stage: "gathering",
    message: "Got it - Lokhandwala Complex, Andheri West.\n\nTwo more quick questions:\n1. How long have these potholes been there?\n2. Has anyone complained before?\n\nThis information will help us ask why no action was taken.",
    questions: ["Over 6 months", "Since monsoon started", "Many complaints made"],
    suggestedDepartment: "municipality",
    suggestedState: "MH"
  },
  
  readyExample: {
    stage: "ready",
    message: "Perfect! I've drafted your RTI application. It asks for:\n- All complaints received about the roads\n- Work orders and repair status\n- Budget allocated for road maintenance\n- Officials responsible\n\nThis will put pressure on BMC to act quickly.",
    suggestedQuery: "Please provide the following information under RTI Act 2005:\n\n1. Details of all complaints received regarding potholes and bad road conditions in Lokhandwala Complex, Andheri West, Mumbai from January 2024 to present date.\n\n2. Copies of work orders issued for road repair in the above-mentioned area during the said period.\n\n3. Details of funds allocated and utilized for road maintenance in this area for FY 2023-24 and 2024-25.\n\n4. Current status of road repair work and expected completion date.\n\n5. Name and designation of officials responsible for road maintenance in this area.",
    suggestedDepartment: "municipality",
    suggestedState: "MH",
    subjectMatter: "Road repair status in Lokhandwala Complex",
    encouragement: "With this RTI, they'll have to respond within 30 days. Keep the acknowledgment safe!"
  },
  
  water: {
    stage: "gathering",
    message: "Water supply issues are really frustrating - it affects everything from cooking to basic hygiene.\n\nTo file a strong RTI, please tell me:\n- Your area/locality name?\n- What's the exact problem - no water, low pressure, or timing issues?",
    questions: ["Malad West", "No water in mornings", "Very low pressure always"],
    suggestedDepartment: "water",
    encouragement: "Access to water is a fundamental right. Let's get this sorted."
  }
};

let mockConversationState = 0;

export const generateRTIQuery = async (message, conversationHistory = [], language = 'en', existingFormData = {}) => {
  return geminiService.processUserMessage(message, conversationHistory);
};

export const geminiService = {
  async processUserMessage(message, conversationHistory = []) {
    if (USE_MOCK) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const lowerMessage = message.toLowerCase();
      
      // Initial greeting
      if (conversationHistory.length === 0) {
        return mockResponses.initial;
      }
      
      // Check for location mentions for pothole
      if (lowerMessage.includes('lokhandwala') || lowerMessage.includes('andheri')) {
        return mockResponses.potholeFollowup;
      }
      
      // Simple keyword matching for demo
      if (lowerMessage.includes('pothole') || lowerMessage.includes('road')) {
        return mockResponses.pothole;
      } else if (lowerMessage.includes('water')) {
        return mockResponses.water;
      } else if (lowerMessage.includes('6 month') || lowerMessage.includes('complain')) {
        return mockResponses.readyExample;
      } else if (conversationHistory.length > 4) {
        // After enough conversation, show ready state
        return mockResponses.readyExample;
      } else {
        return {
          stage: "gathering",
          message: "I hear you, and I want to make sure I understand your situation completely so we can get you the best possible response from the authorities.\n\nCould you tell me a bit more about:\n- Where exactly this is happening?\n- How long it's been going on?\n- How it's affecting you and your family?\n\nDon't worry about formal language - just tell me in your own words. I'll help convert it into a proper RTI that gets results!",
          questions: ["It's been 3 months now", "My children can't study", "Nobody listens to us"],
          encouragement: "You're taking the right step. Many people just suffer in silence, but you're standing up for your rights!"
        };
      }
    }

    try {
      // Build the conversation context
      const fullPrompt = `${RTI_SYSTEM_PROMPT}\n\nConversation history:\n${conversationHistory.map(h => `${h.role}: ${h.message}`).join('\n')}\n\nUser: ${message}\n\nAssistant:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON, if it fails, return as regular message
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // If not JSON, return as conversational message
        return {
          stage: "gathering",
          message: text,
          questions: []
        };
      }
      
      return {
        stage: "gathering",
        message: text,
        questions: []
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  },

  // Generate RTI query from natural language
  async generateRTIQuery(userInput, department, state) {
    const prompt = `Convert this complaint/request into a formal RTI query for ${department} department in ${state}:

User's complaint: "${userInput}"

Generate a formal, legally sound RTI query that:
1. Asks for specific documents/information
2. Includes relevant time periods
3. Uses proper RTI language
4. Is clear and unambiguous

Return only the RTI query text, nothing else.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  },

  // Get department suggestions based on complaint
  async suggestDepartment(complaint) {
    const prompt = `Based on this complaint, which government department should handle this RTI:
"${complaint}"

Choose from: police, municipality, panchayat, pwd, health, education, revenue, transport, electricity, water, agriculture, forest

Return only the department key.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().toLowerCase();
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'municipality'; // default fallback
    }
  }
};

