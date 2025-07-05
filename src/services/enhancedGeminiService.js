import { GoogleGenerativeAI } from '@google/generative-ai';
import rateLimiter from '../utils/rateLimiter';
import ConversationContext from '../utils/conversationContext';

// Initialize Gemini with the working API key from memory
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyANEBeYiW3I_hYvfXWaP9-Un4bpY3R5Hr8';
const USE_MOCK = !API_KEY || API_KEY === '';

const genAI = USE_MOCK ? null : new GoogleGenerativeAI(API_KEY);

const model = USE_MOCK ? null : genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.8,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1200,
  },
});

// Professional RTI conversation prompt - strategic and comprehensive
const ENHANCED_RTI_PROMPT = `You are Sarkar Assistant, a professional RTI expert. Your goal is to help users craft powerful, strategic RTI applications that get results.

STRATEGIC APPROACH - 7 PROFESSIONAL STEPS:
Focus on QUALITY over speed. Each step builds a stronger RTI application.

STEP 1: STRATEGIZE & FRAME QUESTIONS (Most Critical)
Help user define precisely what information they need. Guide them to:
- Ask for specific records/documents (not explanations)
- Keep questions clear, simple, focused
- Break complex requests into numbered points
- Frame for maximum impact

STEP 2: DEFINE SCOPE
- One-line subject for the request
- Time period with start/end dates

STEP 3: GATHER APPLICANT & AUTHORITY DETAILS  
- Which PIO (full office name and address)
- Full name and father's/husband's name
- Complete permanent address

STEP 4: SPECIFY INFORMATION DELIVERY
- How to receive info (post/in person)
- Type of post (ordinary/registered/speed)
- Delivery address confirmation

STEP 5: HANDLE FEES & BPL STATUS
- Agreement to pay required fees
- BPL category and proof status
- Initial application fee deposit details

STEP 6: COMPLETE FINAL DECLARATIONS
- Previous information provided status
- Public availability of information

STEP 7: FINALIZE FOR SUBMISSION
- Place of filing (city/town)
- Current date addition
- Ready for signature

PROFESSIONAL STAGES:
1. FRAME_QUESTIONS: Help craft specific, powerful questions
2. DEFINE_SCOPE: Subject line and time period
3. GATHER_DETAILS: PIO, personal details, addresses
4. DELIVERY_METHOD: How user wants to receive information
5. FEES_BPL: Financial aspects and BPL status
6. DECLARATIONS: Final required declarations
7. RTI_READY: Complete professional RTI application

Response format (JSON):
{
  "stage": "frame_questions|define_scope|gather_details|delivery_method|fees_bpl|declarations|rti_ready",
  "message": "Professional guidance (max 3 sentences)",
  "nextQuestion": "Strategic question to help user craft powerful RTI",
  "extractedInfo": {
    "specificQuestions": ["Question 1", "Question 2", "Question 3"],
    "subjectLine": "one-line subject for the request",
    "timeperiodStart": "start date",
    "timeperiodEnd": "end date",
    "pioOffice": "full PIO office name and address",
    "applicantName": "full name",
    "fatherHusbandName": "father or husband name", 
    "permanentAddress": "complete permanent address",
    "deliveryMethod": "post|in_person",
    "postType": "ordinary|registered|speed",
    "deliveryAddress": "address for information delivery",
    "agreeToPayFees": true/false,
    "bplCategory": true/false,
    "bplProofAttached": true/false,
    "applicationFeeDeposited": true/false,
    "feeDepositDetails": "payment details",
    "informationProvidedBefore": true/false,
    "informationPubliclyAvailable": true/false,
    "placeOfFiling": "city/town where filing"
  },
  "suggestedDepartment": "department_key",
  "suggestedState": "state_code",
  "professionalRTI": "complete professional RTI application when ready",
  "isComplete": true/false
}

PROFESSIONAL EXAMPLES:

STAGE 1 - FRAME QUESTIONS:
User: "Potholes in my street for months"
Response: "I'll help you craft a strategic RTI that gets results. Let's formulate the specific information you need. Instead of just complaining about potholes, let's ask for specific records. What specific documents or information do you want? For example: 'Provide copies of all complaints received about road maintenance in [area] from [date] to [date]' or 'Provide the budget allocation and expenditure details for road repairs in [area]'?"

STAGE 2 - DEFINE SCOPE:
User: "I want all complaints about road maintenance and the budget details"
Response: "Perfect! Now let's define the scope. Please provide a one-line subject for this request, like 'Information on road maintenance complaints and budget allocation for [area]'. Also, what time period should this cover? Please give me start and end dates."

STAGE 3 - GATHER DETAILS:
User: "Subject: Road maintenance information for MG Road area. January 2024 to December 2024"
Response: "Excellent subject and timeframe! Now I need to know: 1) Which Public Information Officer should we send this to? (Which department - Municipal Corporation, PWD, etc.) 2) What's your full name and father's/husband's name? 3) Your complete permanent address?"

STAGE 4 - DELIVERY METHOD:
User: "Municipal Corporation, John Smith, father Raj Smith, 123 MG Road Mumbai"
Response: "Great! Now, how would you like to receive this information - by post or in person? If by post, which type: ordinary, registered, or speed post? And please confirm the address where you want the information delivered."

STAGE 5 - FEES & BPL:
User: "Speed post to same address"
Response: "Perfect! Now for the fees: 1) Do you agree to pay the required fees beyond the initial ₹10 application fee? 2) Do you belong to Below Poverty Line (BPL) category? 3) Have you deposited the initial application fee?"

STAGE 6 - DECLARATIONS:
User: "Yes to fees, no BPL, will deposit fee"
Response: "Almost done! Two final questions: 1) Have you been provided this information before by this office? 2) Is this information already available publicly from this authority?"

STAGE 7 - FINALIZE:
User: "No to both questions"
Response: "Perfect! Last step - from which city/town are you filing this RTI?"

Focus on STRATEGIC QUESTION FRAMING in Stage 1 - this determines RTI success!`;


class EnhancedGeminiService {
  constructor() {
    this.conversationContext = new ConversationContext();
  }

  async processUserMessage(message, conversationHistory = [], voiceData = null) {
    // Record the message in context
    this.conversationContext.extractAndStoreInfo(message, 'user');
    
    // Add to session messages
    this.conversationContext.currentSession.messages.push({
      type: 'user',
      content: message,
      timestamp: new Date(),
      isVoice: !!voiceData,
      voiceData
    });

    // Check rate limit
    if (!USE_MOCK && !rateLimiter.canMakeRequest()) {
      const usageMessage = rateLimiter.getUsageMessage();
      throw new Error(usageMessage.message);
    }

    if (USE_MOCK) {
      return await this.generateMockResponse(message, conversationHistory);
    }

    try {
      if (!USE_MOCK && !rateLimiter.recordRequest()) {
        const usageMessage = rateLimiter.getUsageMessage();
        throw new Error(usageMessage.message);
      }

      const contextualPrompt = this.buildContextualPrompt(message, conversationHistory);
      const result = await model.generateContent(contextualPrompt);
      const response = await result.response;
      const text = response.text();
      
      let parsedResponse;
      try {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no JSON found
          parsedResponse = {
            stage: "problem_understanding",
            message: text,
            nextQuestion: "Could you tell me more details about your issue?",
            extractedInfo: this.conversationContext.currentSession.extractedInfo,
            language: this.conversationContext.currentSession.language
          };
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
        parsedResponse = {
          stage: "problem_understanding", 
          message: text,
          nextQuestion: "Could you tell me more about this issue?",
          extractedInfo: this.conversationContext.currentSession.extractedInfo,
          language: this.conversationContext.currentSession.language
        };
      }

      // Update conversation stage
      this.conversationContext.updateStage(parsedResponse.stage);
      
      // Record assistant message
      this.conversationContext.currentSession.messages.push({
        type: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date(),
        data: parsedResponse
      });

      return parsedResponse;
      
    } catch (error) {
      console.error('Enhanced Gemini API error:', error);
      
      if (error.message && error.message.includes('429')) {
        const usageMessage = rateLimiter.getUsageMessage();
        throw new Error(usageMessage ? usageMessage.message : 'API quota exceeded. Please try the manual form.');
      }
      
      throw error;
    }
  }

  buildContextualPrompt(message, conversationHistory) {
    const context = this.conversationContext.getConversationContext();
    
    let prompt = ENHANCED_RTI_PROMPT + '\n\n';
    
    // Add user context
    if (context.userProfile.name) {
      prompt += `USER CONTEXT: User's name is ${context.userProfile.name}. `;
    }
    
    if (context.userProfile.preferredLanguage === 'hinglish') {
      prompt += `User prefers Hinglish (Hindi-English mix). `;
    }
    
    // Add extracted information context
    const extracted = context.session.extractedInfo;
    if (Object.keys(extracted).length > 0) {
      prompt += `\nALREADY KNOWN INFORMATION (don't ask again):\n`;
      if (extracted.location) prompt += `- Location: ${extracted.location}\n`;
      if (extracted.complaintType) prompt += `- Issue type: ${extracted.complaintType}\n`;
      if (extracted.timeline) prompt += `- Timeline: ${extracted.timeline}\n`;
      if (extracted.name) prompt += `- Name: ${extracted.name}\n`;
    }
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      prompt += '\nCONVERSATION HISTORY:\n';
      conversationHistory.slice(-6).forEach(msg => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    prompt += `\nUser's latest message: "${message}"\n\n`;
    prompt += `Remember: Don't repeat questions about information you already have. Build on what the user has told you. Be contextual and caring.`;
    
    return prompt;
  }

  async generateMockResponse(message, conversationHistory) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const context = this.conversationContext.getConversationContext();
    const extracted = context.session.extractedInfo;
    const lowerMessage = message.toLowerCase();
    
    // Stage 1: Frame Questions (Most Critical)
    if (conversationHistory.length === 0) {
      return {
        stage: "frame_questions",
        message: "Hi! I'm your RTI expert. I'll help you craft a strategic RTI that gets results.",
        nextQuestion: "What issue are you facing? I'll help you frame powerful questions that demand specific records and documents.",
        extractedInfo: extracted
      };
    }
    
    // Continue framing questions if user hasn't provided specific questions yet
    if (!extracted.specificQuestions || extracted.specificQuestions.length === 0) {
      return {
        stage: "frame_questions",
        message: "Let's formulate the specific information you need. Instead of just describing problems, let's ask for specific records.",
        nextQuestion: "What specific documents or information do you want? For example: 'Provide copies of all complaints received about [issue] from [date] to [date]' or 'Provide budget allocation and expenditure details for [service]'?",
        extractedInfo: extracted
      };
    }
    
    // Stage 2: Define Scope
    if (extracted.specificQuestions && extracted.specificQuestions.length > 0 && (!extracted.subjectLine || !extracted.timeperiodStart)) {
      return {
        stage: "define_scope",
        message: "Perfect questions! Now let's define the scope of your request.",
        nextQuestion: "Please provide: 1) A one-line subject for this request 2) Time period with start and end dates (e.g., 'January 2024 to December 2024')",
        extractedInfo: extracted
      };
    }
    
    // Stage 3: Gather Details
    if (extracted.subjectLine && extracted.timeperiodStart && (!extracted.pioOffice || !extracted.applicantName || !extracted.permanentAddress)) {
      return {
        stage: "gather_details",
        message: "Excellent subject and timeframe! Now I need the key details.",
        nextQuestion: "Please provide: 1) Which department/PIO should we send this to? 2) Your full name and father's/husband's name 3) Your complete permanent address",
        extractedInfo: extracted
      };
    }
    
    // Stage 4: Delivery Method
    if (extracted.pioOffice && extracted.applicantName && extracted.permanentAddress && (!extracted.deliveryMethod || !extracted.deliveryAddress)) {
      return {
        stage: "delivery_method",
        message: "Great! Now let's specify how you want to receive the information.",
        nextQuestion: "How would you like to receive this information: 1) By post or in person? 2) If by post, which type: ordinary, registered, or speed post? 3) Delivery address",
        extractedInfo: extracted
      };
    }
    
    // Stage 5: Fees & BPL
    if (extracted.deliveryMethod && extracted.deliveryAddress && (extracted.agreeToPayFees === undefined || extracted.bplCategory === undefined)) {
      return {
        stage: "fees_bpl",
        message: "Perfect! Now for the financial aspects.",
        nextQuestion: "Please confirm: 1) Do you agree to pay required fees beyond ₹10 application fee? 2) Do you belong to Below Poverty Line (BPL) category? 3) Have you deposited the initial application fee?",
        extractedInfo: extracted
      };
    }
    
    // Stage 6: Declarations
    if (extracted.agreeToPayFees !== undefined && extracted.bplCategory !== undefined && (extracted.informationProvidedBefore === undefined || extracted.informationPubliclyAvailable === undefined)) {
      return {
        stage: "declarations",
        message: "Almost done! Two final declarations required.",
        nextQuestion: "Please confirm: 1) Have you been provided this information before by this office? 2) Is this information already available publicly from this authority?",
        extractedInfo: extracted
      };
    }
    
    // Stage 7: RTI Ready
    if (extracted.informationProvidedBefore !== undefined && extracted.informationPubliclyAvailable !== undefined && !extracted.placeOfFiling) {
      return {
        stage: "finalize",
        message: "Perfect! Last step.",
        nextQuestion: "From which city/town are you filing this RTI?",
        extractedInfo: extracted
      };
    }
    
    // Generate final RTI
    if (extracted.placeOfFiling) {
      const professionalRTI = this.generateProfessionalRTI(extracted);
      
      return {
        stage: "rti_ready",
        message: "Your strategic RTI application is ready! This professional approach will get better results.",
        professionalRTI: professionalRTI,
        extractedInfo: extracted,
        isComplete: true
      };
    }
    
    // Default - continue questions
    return {
      stage: "frame_questions",
      message: "I need more details to help you craft a powerful RTI.",
      nextQuestion: "What specific issue are you facing? Let's identify what records you need.",
      extractedInfo: extracted
    };
  }

  guessDepartment(complaintType) {
    const mapping = {
      'road': 'municipality',
      'water': 'municipality',
      'electricity': 'electricity', // Electricity department for power issues
      'power': 'electricity', // Power cuts go to electricity department
      'garbage': 'municipality',
      'documents': 'revenue',
      'pension': 'revenue',
      'health': 'health',
      'education': 'education',
      'police': 'police'
    };
    return mapping[complaintType] || 'municipality';
  }

  guessState(location) {
    if (!location) return 'MH';
    const lowerLocation = location.toLowerCase();
    
    if (lowerLocation.includes('mumbai') || lowerLocation.includes('pune') || lowerLocation.includes('nashik')) return 'MH';
    if (lowerLocation.includes('delhi') || lowerLocation.includes('gurgaon') || lowerLocation.includes('noida')) return 'DL';
    if (lowerLocation.includes('bangalore') || lowerLocation.includes('mysore')) return 'KA';
    if (lowerLocation.includes('chennai') || lowerLocation.includes('coimbatore')) return 'TN';
    if (lowerLocation.includes('patna') || lowerLocation.includes('bihar') || lowerLocation.includes('gaya') || lowerLocation.includes('muzaffarpur')) return 'BR';
    if (lowerLocation.includes('lucknow') || lowerLocation.includes('kanpur') || lowerLocation.includes('agra') || lowerLocation.includes('varanasi')) return 'UP';
    
    return 'MH'; // Default
  }

  getStateName(stateCode) {
    const stateNames = {
      'MH': 'Maharashtra',
      'DL': 'Delhi',
      'KA': 'Karnataka',
      'TN': 'Tamil Nadu',
      'BR': 'Bihar',
      'UP': 'Uttar Pradesh'
    };
    return stateNames[stateCode] || 'Maharashtra';
  }

  generateProfessionalRTI(extracted) {
    const { 
      specificQuestions, 
      subjectLine, 
      timeperiodStart, 
      timeperiodEnd,
      pioOffice,
      applicantName, 
      fatherHusbandName, 
      permanentAddress,
      deliveryMethod,
      postType,
      deliveryAddress,
      agreeToPayFees,
      bplCategory,
      applicationFeeDeposited,
      feeDepositDetails,
      informationProvidedBefore,
      informationPubliclyAvailable,
      placeOfFiling
    } = extracted;
    
    const currentDate = new Date().toLocaleDateString('en-IN');
    
    return `APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005
(FORM-A)

To,
Public Information Officer
${pioOffice || '[Department Name]'}
[Department Address]

Date: ${currentDate}
Place: ${placeOfFiling || '[Place of Filing]'}

Subject: ${subjectLine || 'Information Request'}

Respected Sir/Madam,

1. APPLICANT DETAILS:
Name: ${applicantName || 'To be filled'}
Father's/Husband's Name: ${fatherHusbandName || 'To be filled'}
Address: ${permanentAddress || 'To be filled'}

2. INFORMATION SOUGHT:
Subject Matter: ${subjectLine || 'Information Request'}
Time Period: ${timeperiodStart || '[Start Date]'} to ${timeperiodEnd || '[End Date]'}

Specific details of information required:
${specificQuestions && specificQuestions.length > 0 ? 
  specificQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 
  'Please provide the requested information.'}

3. MODE OF DELIVERY:
Information to be delivered: ${deliveryMethod === 'post' ? 'By Post' : 'In Person'}
${deliveryMethod === 'post' ? `Post Type: ${postType === 'speed' ? 'Speed Post' : postType === 'registered' ? 'Registered Post' : 'Ordinary Post'}` : ''}
Delivery Address: ${deliveryAddress || permanentAddress || 'To be filled'}

4. FEE DETAILS:
Application fee of Rs. 10/-
${agreeToPayFees ? 'I agree to pay the required fees beyond the initial application fee.' : 'I will pay only the initial application fee.'}
${bplCategory ? 'I belong to Below Poverty Line (BPL) category.' : 'I do not belong to BPL category.'}
${applicationFeeDeposited ? `Payment Details: ${feeDepositDetails || 'Fee deposited as per rules'}` : 'Fee to be deposited separately.'}

5. DECLARATIONS:
- Information not provided before: ${informationProvidedBefore === false ? 'Yes' : 'No'}
- Information not publicly available: ${informationPubliclyAvailable === false ? 'Yes' : 'No'}

I request you to provide the above information within the stipulated time frame as per the RTI Act 2005.

Thank you.

Yours faithfully,
${applicantName || '[Your Name]'}
(Signature)`;
  }

  // Legacy method for backward compatibility
  generateFocusedRTIQuery(extracted) {
    return this.generateProfessionalRTI(extracted);
  }

  // Save successful conversation
  saveSuccessfulConversation(rtiQuery) {
    this.conversationContext.recordSuccess(rtiQuery);
    this.conversationContext.saveConversation();
  }

  // Get usage info
  getUsageInfo() {
    return rateLimiter.getUsageInfo();
  }

  getUsageMessage() {
    return rateLimiter.getUsageMessage();
  }
}

// Create singleton instance
const enhancedGeminiService = new EnhancedGeminiService();

export default enhancedGeminiService;
export { EnhancedGeminiService }; 