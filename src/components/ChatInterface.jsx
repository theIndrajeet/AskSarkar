import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, ChevronDown, Sparkles, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import enhancedGeminiService from '../services/enhancedGeminiService';
import VoiceInput from './VoiceInput';
import UsageDisplay from './UsageDisplay';

const ChatInterface = ({ onComplete, existingFormData, onSwitchToManual }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [usageKey, setUsageKey] = useState(0);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [rtiCompleted, setRtiCompleted] = useState(false);
  const [completedFormData, setCompletedFormData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with personalized greeting
  useEffect(() => {
    const greeting = enhancedGeminiService.conversationContext.getPersonalizedGreeting();
    setMessages([{
      type: 'assistant',
      content: greeting,
      timestamp: new Date(),
      data: { stage: 'initial' }
    }]);
  }, []);

  const suggestedQuestions = i18n.language === 'hi' ? [
    "मेरी गली में 6 महीने से गड्ढे हैं",
    "पानी की सप्लाई बहुत कम आती है",
    "बिजली हर रोज जाती है", 
    "पेंशन 3 महीने से नहीं मिली",
    "कचरा रोज नहीं उठाते",
    "बर्थ सर्टिफिकेट अभी तक नहीं मिला"
  ] : [
    "My street has potholes for 6 months",
    "Water supply is very irregular", 
    "Power cuts happen daily",
    "Pension not received for 3 months",
    "Garbage not collected regularly",
    "Birth certificate still pending"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setSuggestionsExpanded(false);
    setConversationStarted(true);
    
    // Auto-submit the suggestion
    setTimeout(() => {
      handleSubmitMessage(suggestion);
    }, 100);
  };

  const handleVoiceInput = (transcript, voiceData) => {
    setInput(transcript);
    setShowSuggestions(false);
    setConversationStarted(true);
    
    // Auto-submit voice input
    setTimeout(() => {
      handleSubmitMessage(transcript, voiceData);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmitMessage(input.trim());
  };

  const handleSubmitMessage = async (messageText, voiceData = null) => {
    if (!messageText || isLoading) return;

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      isVoice: !!voiceData,
      voiceData
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    setConversationStarted(true);

    try {
      const response = await enhancedGeminiService.processUserMessage(
        messageText,
        messages,
        voiceData
      );

      const assistantMessage = {
        type: 'assistant',
        content: response.message,
        data: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setUsageKey(prev => prev + 1);

      // If RTI is ready, save the form data for manual completion
      if (response.stage === 'rti_ready' && response.isComplete) {
        enhancedGeminiService.saveSuccessfulConversation(response.suggestedQuery);
        
        // Map conversation data to PDFPreview expected format
        const extractedInfo = response.extractedInfo || {};
        const formData = {
          // Basic RTI fields
          query: response.professionalRTI || response.suggestedQuery,
          subjectMatter: extractedInfo.subjectLine || 'RTI Information Request',
          
          // Personal details (use extracted info from conversation)
          applicantName: extractedInfo.applicantName || 'To be filled',
          fatherHusbandName: extractedInfo.fatherHusbandName || 'To be filled',
          address: extractedInfo.permanentAddress || 'To be filled',
          
          // Department and state mapping
          departmentType: guessDepartmentFromPIO(extractedInfo.pioOffice) || 'municipality',
          state: guessStateFromPlace(extractedInfo.placeOfFiling) || 'MH',
          
          // Delivery preferences (from conversation)
          deliveryMethod: extractedInfo.deliveryMethod === 'post' ? 'byPost' : 'inPerson',
          postType: extractedInfo.postType || 'speed',
          sameAsPermAddress: true,
          deliveryAddress: extractedInfo.deliveryAddress || extractedInfo.permanentAddress || 'To be filled',
          
          // Fee details (from conversation)
          belongToBPL: extractedInfo.bplCategory || false,
          bplProofProvided: extractedInfo.bplProofAttached || false,
          depositedFee: extractedInfo.applicationFeeDeposited || false,
          paymentDetails: extractedInfo.feeDepositDetails || 'Fee to be paid as per rules',
          
          // Dates (from conversation)
          fromDate: extractedInfo.timeperiodStart || '',
          toDate: extractedInfo.timeperiodEnd || '',
          
          // Identity (optional)
          identityParticulars: '',
          
          // Additional professional fields
          informationProvidedBefore: extractedInfo.informationProvidedBefore || false,
          informationPubliclyAvailable: extractedInfo.informationPubliclyAvailable || false,
          placeOfFiling: extractedInfo.placeOfFiling || '',
          
          // Include original extracted info for reference
          extractedInfo: extractedInfo
        };

        setRtiCompleted(true);
        setCompletedFormData(formData);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error.message && (error.message.includes('quota') || error.message.includes('limit'))) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: error.message,
          timestamp: new Date()
        }]);
        setUsageKey(prev => prev + 1);
      } else {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: "I'm having trouble understanding right now. Could you try rephrasing that, or would you prefer to use the manual form?",
          timestamp: new Date(),
          data: { 
            showFallback: true,
            stage: 'error' 
          }
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressStage = (stage) => {
    const stages = {
      'initial': 0,
      'frame_questions': 1,
      'define_scope': 2,
      'gather_details': 3,
      'delivery_method': 4,
      'fees_bpl': 5,
      'declarations': 6,
      'finalize': 7,
      'rti_ready': 7
    };
    return stages[stage] || 0;
  };

  const getProgressPercentage = (stage) => {
    const currentStage = getProgressStage(stage);
    return Math.round((currentStage / 7) * 100);
  };

  // Helper methods for mapping professional RTI fields
  const guessDepartmentFromPIO = (pioOffice) => {
    if (!pioOffice) return 'municipality';
    const office = pioOffice.toLowerCase();
    
    if (office.includes('municipal') || office.includes('corporation')) return 'municipality';
    if (office.includes('electricity') || office.includes('power')) return 'electricity';
    if (office.includes('police')) return 'police';
    if (office.includes('health')) return 'health';
    if (office.includes('education')) return 'education';
    if (office.includes('revenue')) return 'revenue';
    if (office.includes('pwd') || office.includes('public works')) return 'pwd';
    
    return 'municipality';
  };

  const guessStateFromPlace = (place) => {
    if (!place) return 'MH';
    const location = place.toLowerCase();
    
    if (location.includes('mumbai') || location.includes('pune') || location.includes('nashik')) return 'MH';
    if (location.includes('delhi') || location.includes('gurgaon') || location.includes('noida')) return 'DL';
    if (location.includes('bangalore') || location.includes('mysore')) return 'KA';
    if (location.includes('chennai') || location.includes('coimbatore')) return 'TN';
    if (location.includes('patna') || location.includes('bihar') || location.includes('gaya')) return 'BR';
    if (location.includes('lucknow') || location.includes('kanpur') || location.includes('agra')) return 'UP';
    
    return 'MH';
  };

  const handleCompleteRTI = () => {
    if (completedFormData && onComplete) {
      onComplete(completedFormData);
    }
  };

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] bg-white rounded-lg border border-border-light overflow-hidden">
      {/* Usage Display */}
      <UsageDisplay key={usageKey} onSwitch={onSwitchToManual} />
      
      {/* Conversation Progress Bar */}
      {conversationStarted && messages.length > 2 && (
        <div className="px-3 sm:px-4 py-2 bg-cream/30 border-b border-border-light">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} />
              RTI Application Progress
            </span>
            <span>{getProgressPercentage(messages[messages.length - 1]?.data?.stage || 'initial')}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-red-primary to-red-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(messages[messages.length - 1]?.data?.stage || 'initial')}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 sm:gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`relative flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              msg.type === 'user' ? 'bg-text-primary text-cream' : 'bg-gray-200'
            }`}>
              {msg.type === 'user' ? <User size={14} className="sm:w-4 sm:h-4" /> : <Bot size={14} className="sm:w-4 sm:h-4" />}
              
              {/* Voice indicator */}
              {msg.isVoice && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div className={`flex-1 max-w-[85%] sm:max-w-[80%]`}>
              <div className={`inline-block p-2.5 sm:p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-text-primary text-cream' 
                  : 'bg-white border border-border-light shadow-sm'
              }`}>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.type === 'user' ? '' : 'text-text-primary'
                }`}>
                  {msg.content}
                </p>
                
                {/* Show RTI preview if available */}
                {(msg.data?.suggestedQuery || msg.data?.professionalRTI) && (
                  <div className="mt-3 p-3 bg-cream border border-border-light rounded">
                    <p className="text-xs uppercase tracking-wider mb-1 text-text-secondary">
                      Professional RTI Application Preview:
                    </p>
                    <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">
                      {msg.data.professionalRTI || msg.data.suggestedQuery}
                    </pre>
                  </div>
                )}

                {/* Show action card if RTI is ready */}
                {msg.data?.stage === 'rti_ready' && (
                  <div className="mt-3 p-3 bg-red-primary text-cream rounded">
                    <p className="font-medium text-sm mb-2">
                      ✓ RTI Application Ready
                    </p>
                    <p className="text-xs opacity-90 mb-3">
                      Your RTI application has been drafted successfully. Click below to proceed to the final form where you can review and download your application.
                    </p>
                    {rtiCompleted && (
                      <button
                        onClick={handleCompleteRTI}
                        className="w-full bg-white text-red-primary font-medium text-sm py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                      >
                        📄 Proceed to Final Form
                      </button>
                    )}
                  </div>
                )}

                {/* Show follow-up suggestions */}
                {msg.data?.followUpSuggestions && msg.data.followUpSuggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-medium mb-2 text-blue-800">💡 Related queries you might want to ask:</p>
                    <div className="space-y-1">
                      {msg.data.followUpSuggestions.slice(0, 3).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1 rounded transition-colors"
                        >
                          • {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show encouragement */}
                {msg.data?.encouragement && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                    <span className="font-medium">💪 </span>
                    {msg.data.encouragement}
                  </div>
                )}

                {/* Show next question if available */}
                {msg.data?.nextQuestion && msg.data.stage !== 'rti_ready' && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
                    <span className="font-medium">❓ Next: </span>
                    {msg.data.nextQuestion}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border-light rounded-lg shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-text-secondary">{t('chat.thinking')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion bubbles */}
      {showSuggestions && messages.length === 1 && (
        <div className="border-t border-border-light bg-cream/30">
          <div className="px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-secondary uppercase tracking-wider">
                {i18n.language === 'hi' ? 'सुझाए गए प्रश्न' : 'Common Issues'}
              </p>
              <button
                onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
                className="sm:hidden p-1 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronDown 
                  size={16} 
                  className={`transform transition-transform ${suggestionsExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {/* Mobile: Show first 2 suggestions, expandable */}
            <div className="sm:hidden">
              <div className="space-y-2">
                {suggestedQuestions.slice(0, suggestionsExpanded ? suggestedQuestions.length : 2).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="w-full text-left px-3 py-2.5 text-sm bg-white border border-border-light rounded-lg hover:border-red-primary hover:text-red-primary hover:bg-red-primary/5 transition-all duration-200 shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Show all suggestions in a flex wrap */}
            <div className="hidden sm:block">
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="px-3 py-2 text-sm bg-white border border-border-light rounded-full hover:border-red-primary hover:text-red-primary hover:bg-red-primary/5 transition-all duration-200 shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RTI Completion Button */}
      {rtiCompleted && (
        <div className="border-t border-border-light bg-green-50 border-green-200">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-green-800 text-sm">🎉 RTI Application Complete!</p>
                <p className="text-xs text-green-600">Ready to proceed to the final form</p>
              </div>
              <div className="text-2xl">100%</div>
            </div>
            <button
              onClick={handleCompleteRTI}
              className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              📄 Proceed to Final Form & Download RTI
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      {!rtiCompleted && (
        <form onSubmit={handleSubmit} className="border-t border-border-light bg-white">
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder') || "Type your complaint or query here..."}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary/20 focus:border-red-primary transition-all text-sm"
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              <VoiceInput
                onVoiceInput={handleVoiceInput}
                isDisabled={isLoading}
                language={enhancedGeminiService.conversationContext.currentSession.language}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 bg-red-primary text-cream rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <Send size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatInterface; 