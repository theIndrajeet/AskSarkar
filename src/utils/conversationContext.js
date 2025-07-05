// Context Memory and Conversation State Management
// Stores user preferences, conversation history, and learned patterns

const CONTEXT_STORAGE_KEY = 'ask_sarkar_context';
const CONVERSATION_STORAGE_KEY = 'ask_sarkar_conversations';
const MAX_STORED_CONVERSATIONS = 10;

class ConversationContext {
  constructor() {
    this.context = this.loadContext();
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      messages: [],
      extractedInfo: {},
      stage: 'initial',
      language: 'en',
      isVoiceEnabled: false
    };
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadContext() {
    try {
      const stored = localStorage.getItem(CONTEXT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
    
    return {
      userProfile: {
        name: null,
        location: null,
        preferredLanguage: 'en',
        commonIssues: [],
        lastUsed: null
      },
      preferences: {
        conversationStyle: 'empathetic',
        followUpSuggestions: true,
        voiceInput: false,
        smartReminders: true
      },
      learnedPatterns: {
        frequentComplaints: {},
        locationMentions: {},
        departmentMapping: {},
        successfulQueries: []
      },
      stats: {
        totalConversations: 0,
        successfulRTIs: 0,
        averageConversationLength: 0,
        lastActiveDate: null
      }
    };
  }

  saveContext() {
    try {
      this.context.stats.lastActiveDate = new Date().toISOString();
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(this.context));
    } catch (error) {
      console.error('Error saving context:', error);
    }
  }

  // Store conversation for future reference
  saveConversation() {
    try {
      const conversations = this.getStoredConversations();
      const conversationSummary = {
        id: this.currentSession.id,
        startTime: this.currentSession.startTime,
        endTime: new Date(),
        messageCount: this.currentSession.messages.length,
        extractedInfo: this.currentSession.extractedInfo,
        stage: this.currentSession.stage,
        language: this.currentSession.language,
        wasSuccessful: this.currentSession.stage === 'completed'
      };

      conversations.unshift(conversationSummary);
      
      // Keep only recent conversations
      if (conversations.length > MAX_STORED_CONVERSATIONS) {
        conversations.splice(MAX_STORED_CONVERSATIONS);
      }

      localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
      
      // Update stats
      this.context.stats.totalConversations++;
      if (conversationSummary.wasSuccessful) {
        this.context.stats.successfulRTIs++;
      }
      this.saveContext();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  getStoredConversations() {
    try {
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  // Extract and store information from user messages - professional RTI approach
  extractAndStoreInfo(message, messageType = 'user') {
    if (messageType !== 'user') return;

    const lowerMessage = message.toLowerCase();
    
    // Extract professional RTI fields
    this.extractSpecificQuestions(message);
    this.extractSubjectLine(message);
    this.extractTimePeriod(message);
    this.extractPIOOffice(message);
    this.extractPersonalInfo(message);
    this.extractDeliveryPreferences(message);
    this.extractFeesAndBPL(message);
    this.extractDeclarations(message);
    this.extractPlaceOfFiling(message);
    this.detectLanguagePreference(message);
  }

  extractLocation(message) {
    // Common location patterns
    const locationPatterns = [
      /(?:in|at|near|from)\s+([a-zA-Z\s]+?)(?:\s|,|$)/gi,
      /([a-zA-Z\s]+?)\s+(?:area|colony|sector|block|road|street)/gi,
      /(?:मेरे|हमारे|यहाँ)\s+([a-zA-Z\u0900-\u097F\s]+?)(?:\s+में|$)/gi
    ];

    locationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const location = match[1].trim();
        if (location.length > 2 && location.length < 50) {
          this.currentSession.extractedInfo.location = location;
          this.context.learnedPatterns.locationMentions[location] = 
            (this.context.learnedPatterns.locationMentions[location] || 0) + 1;
        }
      }
    });
  }

  extractComplaintType(message) {
    const complaintKeywords = {
      'road': ['pothole', 'road', 'street', 'gaddha', 'sadak'],
      'water': ['water', 'pani', 'supply', 'tap', 'bore'],
      'electricity': ['light', 'bijli', 'power', 'current', 'electricity'],
      'garbage': ['garbage', 'waste', 'kachara', 'safai'],
      'documents': ['certificate', 'license', 'passport', 'ration', 'praman'],
      'pension': ['pension', 'scholarship', 'benefit', 'allowance']
    };

    for (const [type, keywords] of Object.entries(complaintKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        this.currentSession.extractedInfo.complaintType = type;
        this.context.learnedPatterns.frequentComplaints[type] = 
          (this.context.learnedPatterns.frequentComplaints[type] || 0) + 1;
        break;
      }
    }
  }

  extractTimeInfo(message) {
    const timePatterns = [
      /(\d+)\s*(?:month|months|महीने|महीना)/gi,
      /(\d+)\s*(?:year|years|साल|वर्ष)/gi,
      /(?:since|from|के बाद से)\s+([a-zA-Z\s]+)/gi
    ];

    timePatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match) {
        this.currentSession.extractedInfo.timeline = match[0];
      }
    });
  }

  extractTimeline(message) {
    // Extract timeline information
    const timelinePatterns = [
      /(\d+)\s*(?:months?|महीने?|महीना)/gi,
      /(\d+)\s*(?:weeks?|सप्ताह?|हफ्ते?)/gi,
      /(\d+)\s*(?:days?|दिन)/gi,
      /(\d+)\s*(?:years?|साल|वर्ष)/gi,
      /(?:for|since|from|से)\s*(\d+)\s*(?:months?|weeks?|days?|years?|महीने?|सप्ताह?|दिन|साल)/gi,
      /(?:past|last|पिछले)\s*(\d+)\s*(?:months?|weeks?|days?|years?|महीने?|सप्ताह?|दिन|साल)/gi
    ];

    timelinePatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match) {
        const timeline = match[0].trim();
        if (timeline.length > 2) {
          this.currentSession.extractedInfo.timeline = timeline;
        }
      }
    });
  }

  extractImpact(message) {
    // Extract impact information
    const impactPatterns = [
      /(?:difficult|problem|issue|trouble|परेशानी|मुश्किल|दिक्कत)/gi,
      /(?:affect|impact|inconvenience|प्रभाव|असुविधा)/gi,
      /(?:daily|every day|रोज|प्रतिदिन)/gi,
      /(?:vehicle|car|bike|walking|गाड़ी|कार|बाइक|पैदल)/gi
    ];

    let impactWords = [];
    impactPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        impactWords.push(...matches);
      }
    });

    if (impactWords.length > 0) {
      // Store the original message segment that contains impact description
      const impactSegment = message.split(/[,.!?]/).find(segment => 
        impactWords.some(word => segment.toLowerCase().includes(word.toLowerCase()))
      );
      if (impactSegment) {
        this.currentSession.extractedInfo.impact = impactSegment.trim();
      }
    }
  }

  extractDepartmentConfirmation(message) {
    // Extract department confirmation
    const departmentConfirmations = {
      'municipality': ['municipal', 'corporation', 'civic', 'city', 'नगर', 'महानगर'],
      'electricity': ['electricity', 'power', 'bijli', 'विद्युत', 'बिजली'],
      'police': ['police', 'cops', 'पुलिस'],
      'health': ['health', 'medical', 'hospital', 'स्वास्थ्य'],
      'education': ['education', 'school', 'शिक्षा'],
      'revenue': ['revenue', 'documents', 'certificate', 'राजस्व'],
      'pwd': ['pwd', 'public works', 'construction', 'निर्माण']
    };

    const confirmationWords = ['yes', 'correct', 'right', 'okay', 'ok', 'हाँ', 'सही', 'ठीक'];
    
    // Check if user confirms suggested department
    if (confirmationWords.some(word => message.includes(word))) {
      // Keep existing suggested department as confirmed
      // This will be handled by the conversation flow
    }
    
    // Check if user mentions a specific department
    for (const [dept, keywords] of Object.entries(departmentConfirmations)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        this.currentSession.extractedInfo.confirmedDepartment = dept;
        break;
      }
    }

    // Extract state confirmation
    const stateNames = {
      'maharashtra': 'MH',
      'delhi': 'DL',
      'bihar': 'BR',
      'uttar pradesh': 'UP',
      'karnataka': 'KA',
      'tamil nadu': 'TN'
    };

    for (const [stateName, stateCode] of Object.entries(stateNames)) {
      if (message.includes(stateName)) {
        this.currentSession.extractedInfo.confirmedState = stateCode;
        break;
      }
    }
  }

  extractPersonalInfo(message) {
    // Extract complete address
    if (message.includes(',') && message.length > 20) {
      // Likely a complete address with commas
      this.currentSession.extractedInfo.completeAddress = message.trim();
    }
    
    // Extract name and father's name patterns
    const nameWithFatherPatterns = [
      /([a-zA-Z\u0900-\u097F\s]+?),?\s*(?:father|dad|papa|पिता)\s+([a-zA-Z\u0900-\u097F\s]+)/gi,
      /([a-zA-Z\u0900-\u097F\s]+?),?\s*(?:husband|पति)\s+([a-zA-Z\u0900-\u097F\s]+)/gi
    ];

    nameWithFatherPatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match && match[1].length > 2 && match[2].length > 2) {
        this.currentSession.extractedInfo.applicantName = match[1].trim();
        this.currentSession.extractedInfo.fatherHusbandName = match[2].trim();
        
        if (!this.context.userProfile.name) {
          this.context.userProfile.name = match[1].trim();
        }
      }
    });

    // Extract simple name if no father's name pattern found
    if (!this.currentSession.extractedInfo.applicantName) {
      const namePatterns = [
        /(?:my name is|i am|मेरा नाम)\s+([a-zA-Z\u0900-\u097F\s]+?)(?:\s|,|$)/gi,
        /^([a-zA-Z\u0900-\u097F\s]+?)(?:\s|,|$)/gi
      ];

      namePatterns.forEach(pattern => {
        const match = pattern.exec(message);
        if (match && match[1].length > 2 && match[1].length < 30) {
          this.currentSession.extractedInfo.applicantName = match[1].trim();
          if (!this.context.userProfile.name) {
            this.context.userProfile.name = match[1].trim();
          }
        }
      });
    }
  }

  detectLanguagePreference(message) {
    // Detect if user is using Hindi/Hinglish
    const hindiCharacters = message.match(/[\u0900-\u097F]/g);
    const hindiWords = ['aur', 'kar', 'hai', 'nahi', 'kya', 'mere', 'yahan', 'problem'];
    
    const hasHindi = hindiCharacters && hindiCharacters.length > 0;
    const hasHinglish = hindiWords.some(word => message.toLowerCase().includes(word));
    
    if (hasHindi || hasHinglish) {
      this.currentSession.language = 'hinglish';
      this.context.userProfile.preferredLanguage = 'hinglish';
    }
  }

  // Get conversation context for AI
  getConversationContext() {
    return {
      session: this.currentSession,
      userProfile: this.context.userProfile,
      preferences: this.context.preferences,
      learnedPatterns: this.context.learnedPatterns,
      previousConversations: this.getStoredConversations().slice(0, 3)
    };
  }

  // Generate smart follow-up suggestions based on context
  generateFollowUpSuggestions() {
    const suggestions = [];
    const { extractedInfo } = this.currentSession;
    
    // If we have a complaint type, suggest related queries
    if (extractedInfo.complaintType) {
      const relatedSuggestions = this.getRelatedSuggestions(extractedInfo.complaintType);
      suggestions.push(...relatedSuggestions);
    }
    
    // If we have location, suggest area-specific queries
    if (extractedInfo.location) {
      suggestions.push(`What other issues are common in ${extractedInfo.location}?`);
    }
    
    // Based on user's previous successful patterns
    const successfulPatterns = this.context.learnedPatterns.successfulQueries;
    if (successfulPatterns.length > 0) {
      suggestions.push(successfulPatterns[Math.floor(Math.random() * successfulPatterns.length)]);
    }
    
    return suggestions;
  }

  getRelatedSuggestions(complaintType) {
    const related = {
      'road': [
        'Ask about budget allocated for road maintenance',
        'Request timeline for pending repairs',
        'Get list of all complaints from your area'
      ],
      'water': [
        'Ask about water quality test reports',
        'Request pipeline maintenance schedule',
        'Get details of water connection applications'
      ],
      'electricity': [
        'Ask about power cut schedules',
        'Request meter reading complaints',
        'Get details of pending connections'
      ]
    };
    
    return related[complaintType] || [];
  }

  // Update conversation stage
  updateStage(newStage) {
    this.currentSession.stage = newStage;
  }

  // Record successful RTI
  recordSuccess(rtiQuery) {
    this.context.learnedPatterns.successfulQueries.push(rtiQuery);
    this.context.stats.successfulRTIs++;
    this.updateStage('completed');
    this.saveContext();
  }

  // Get personalized greeting based on context
  getPersonalizedGreeting() {
    const { userProfile, stats } = this.context;
    
    if (userProfile.name && stats.totalConversations > 0) {
      const greetings = [
        `Welcome back, ${userProfile.name}! How can I help you today?`,
        `Hi ${userProfile.name}! Ready to file another RTI application?`,
        `Hello ${userProfile.name}! What issue would you like to address today?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (stats.totalConversations > 0) {
      return "Welcome back! I remember our previous conversations. What new issue can I help you with today?";
    }
    
    return "Hi! I'm your RTI assistant. I'll help you file applications to get answers from government departments. What issue are you facing?";
  }

  // Professional RTI extraction methods
  extractSpecificQuestions(message) {
    // Extract specific RTI questions that ask for documents/records
    const questionPatterns = [
      /provide\s+(?:copies?|details?|information|records?|documents?)\s+(?:of|about|regarding)\s+([^.?!]+)/gi,
      /(?:what|which|how\s+many|how\s+much)\s+([^.?!]+)/gi,
      /(?:list|show|give)\s+(?:me|us)?\s*([^.?!]+)/gi
    ];

    let questions = [];
    questionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const question = match[0].trim();
        if (question.length > 10 && question.length < 200) {
          questions.push(question);
        }
      }
    });

    if (questions.length > 0) {
      this.currentSession.extractedInfo.specificQuestions = questions;
    }
  }

  extractSubjectLine(message) {
    // Extract subject line patterns
    const subjectPatterns = [
      /subject:?\s*([^.!?]+)/gi,
      /title:?\s*([^.!?]+)/gi,
      /(?:information|details|records)\s+(?:on|about|regarding)\s+([^.!?]+)/gi
    ];

    subjectPatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match && match[1].trim().length > 5) {
        this.currentSession.extractedInfo.subjectLine = match[1].trim();
      }
    });
  }

  extractTimePeriod(message) {
    // Extract time period patterns
    const timePatterns = [
      /(\w+\s+\d{4})\s+to\s+(\w+\s+\d{4})/gi,
      /(\d{2}\/\d{2}\/\d{4})\s+to\s+(\d{2}\/\d{2}\/\d{4})/gi,
      /from\s+(\w+\s+\d{4})\s+to\s+(\w+\s+\d{4})/gi,
      /(\d{4})\s+to\s+(\d{4})/gi
    ];

    timePatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match) {
        this.currentSession.extractedInfo.timeperiodStart = match[1].trim();
        this.currentSession.extractedInfo.timeperiodEnd = match[2].trim();
      }
    });
  }

  extractPIOOffice(message) {
    // Extract PIO office/department information
    const deptPatterns = [
      'municipal corporation',
      'municipality',
      'electricity department',
      'police',
      'health department',
      'education department',
      'revenue department',
      'pwd',
      'public works'
    ];

    const lowerMessage = message.toLowerCase();
    for (const dept of deptPatterns) {
      if (lowerMessage.includes(dept)) {
        this.currentSession.extractedInfo.pioOffice = dept;
        break;
      }
    }
  }

  extractDeliveryPreferences(message) {
    // Extract delivery method preferences
    const deliveryPatterns = {
      'post': ['post', 'mail', 'courier'],
      'in_person': ['in person', 'collect', 'pickup', 'personally']
    };

    const postTypes = {
      'ordinary': ['ordinary', 'regular', 'normal'],
      'registered': ['registered', 'regd'],
      'speed': ['speed', 'express', 'fast']
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [method, keywords] of Object.entries(deliveryPatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        this.currentSession.extractedInfo.deliveryMethod = method;
        break;
      }
    }

    for (const [type, keywords] of Object.entries(postTypes)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        this.currentSession.extractedInfo.postType = type;
        break;
      }
    }
  }

  extractFeesAndBPL(message) {
    // Extract fees and BPL information
    const lowerMessage = message.toLowerCase();

    // Fee agreement patterns
    if (lowerMessage.includes('agree to pay') || lowerMessage.includes('yes') && lowerMessage.includes('fees')) {
      this.currentSession.extractedInfo.agreeToPayFees = true;
    } else if (lowerMessage.includes('no') && lowerMessage.includes('fees')) {
      this.currentSession.extractedInfo.agreeToPayFees = false;
    }

    // BPL patterns
    if (lowerMessage.includes('bpl') || lowerMessage.includes('below poverty')) {
      this.currentSession.extractedInfo.bplCategory = true;
    } else if (lowerMessage.includes('no') && (lowerMessage.includes('bpl') || lowerMessage.includes('poverty'))) {
      this.currentSession.extractedInfo.bplCategory = false;
    }

    // Fee deposit patterns
    if (lowerMessage.includes('deposited') || lowerMessage.includes('paid')) {
      this.currentSession.extractedInfo.applicationFeeDeposited = true;
    }
  }

  extractDeclarations(message) {
    // Extract declaration responses
    const lowerMessage = message.toLowerCase();

    // Information provided before
    if (lowerMessage.includes('provided before') || lowerMessage.includes('given before')) {
      this.currentSession.extractedInfo.informationProvidedBefore = true;
    } else if (lowerMessage.includes('no') && lowerMessage.includes('before')) {
      this.currentSession.extractedInfo.informationProvidedBefore = false;
    }

    // Information publicly available
    if (lowerMessage.includes('publicly available') || lowerMessage.includes('already available')) {
      this.currentSession.extractedInfo.informationPubliclyAvailable = true;
    } else if (lowerMessage.includes('no') && lowerMessage.includes('available')) {
      this.currentSession.extractedInfo.informationPubliclyAvailable = false;
    }
  }

  extractPlaceOfFiling(message) {
    // Extract place of filing
    const placePatterns = [
      /(?:from|in|at)\s+([a-zA-Z\s]+?)(?:\s|,|$)/gi,
      /([a-zA-Z\s]+?)\s+(?:city|town|district)/gi
    ];

    placePatterns.forEach(pattern => {
      const match = pattern.exec(message);
      if (match && match[1].trim().length > 2 && match[1].trim().length < 30) {
        this.currentSession.extractedInfo.placeOfFiling = match[1].trim();
      }
    });
  }

  // Clear context (for privacy)
  clearContext() {
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    this.context = this.loadContext();
  }
}

export default ConversationContext; 