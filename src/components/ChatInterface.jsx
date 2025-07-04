import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateRTIQuery } from '../services/geminiService';

const ChatInterface = ({ onComplete, existingFormData }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: t('chat.welcome'),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = i18n.language === 'hi' ? [
    "मेरी गली में 6 महीने से गड्ढे हैं",
    "मेरे इलाके में पानी की आपूर्ति अनियमित है",
    "3 महीने से पेंशन नहीं मिली",
    "जन्म प्रमाण पत्र आवेदन लंबित है",
    "स्ट्रीट लाइट काम नहीं कर रही",
    "कचरा नियमित रूप से नहीं उठाया जाता"
  ] : [
    "My street has potholes for 6 months",
    "Water supply is irregular in my area",
    "Pension not received for 3 months",
    "Birth certificate application pending",
    "Street lights not working",
    "Garbage not collected regularly"
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await generateRTIQuery(
        input.trim(),
        messages,
        i18n.language,
        existingFormData
      );

      const assistantMessage = {
        type: 'assistant',
        content: response.message,
        data: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.isComplete && response.formData) {
        setTimeout(() => {
          onComplete(response.formData);
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: t('chat.error'),
        timestamp: new Date()
      }]);
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

  return (
    <div className="flex flex-col h-[500px] border border-border-light rounded-lg overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.type === 'user' ? 'bg-text-primary text-cream' : 'bg-gray-200'
            }`}>
              {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message bubble */}
            <div className={`flex-1 max-w-[80%]`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-text-primary text-cream' 
                  : 'bg-white border border-border-light'
              }`}>
                <p className={`whitespace-pre-wrap ${
                  msg.type === 'user' ? 'text-sm' : 'text-sm text-text-primary'
                }`}>
                  {msg.content}
                </p>
                
                {/* Show RTI preview if available */}
                {msg.data?.suggestedQuery && (
                  <div className="mt-3 p-3 bg-cream border border-border-light rounded">
                    <p className="text-xs uppercase tracking-wider mb-1 text-text-secondary">
                      RTI Query Preview:
                    </p>
                    <p className="text-sm italic text-text-primary">
                      "{msg.data.suggestedQuery}"
                    </p>
                  </div>
                )}

                {/* Show action card if RTI is ready */}
                {msg.data?.isComplete && (
                  <div className="mt-3 p-3 bg-red-primary text-cream rounded">
                    <p className="font-medium text-sm mb-1">
                      ✓ RTI Application Ready
                    </p>
                    <p className="text-xs opacity-90">
                      {t('chat.readyToGenerate')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border-light rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-text-secondary">{t('chat.thinking')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion bubbles */}
      {showSuggestions && messages.length === 1 && (
        <div className="px-4 py-3 bg-cream/30 border-t border-border-light">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">
            {i18n.language === 'hi' ? 'सुझाए गए प्रश्न' : 'Common Issues - Click to Select'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(question)}
                className="px-4 py-2 text-sm bg-white border border-border-light rounded-full hover:border-red-primary hover:text-red-primary hover:bg-red-primary/5 transition-all duration-200 shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-border-light p-4 bg-white">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder') || "Type your complaint or query here..."}
            className="flex-1 px-4 py-2 border border-border-light rounded focus:outline-none focus:border-text-secondary transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-red-primary text-cream rounded hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 