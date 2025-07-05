import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VoiceInput = ({ onVoiceInput, isDisabled = false, language = 'en' }) => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language]);

  const setupRecognition = () => {
    const recognition = recognitionRef.current;
    
    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // Set language based on user preference
    const langCode = getLanguageCode(language);
    recognition.lang = langCode;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setConfidence(0);
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
          maxConfidence = Math.max(maxConfidence, result[0].confidence || 0.5);
        } else {
          interimTranscript += text;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      setConfidence(maxConfidence);

      // If we have a final result, process it
      if (finalTranscript) {
        processVoiceInput(finalTranscript, maxConfidence);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not accessible. Please check permissions.',
        'not-allowed': 'Microphone permission denied. Please enable microphone access.',
        'network': 'Network error. Please check your connection.',
        'service-not-allowed': 'Speech recognition service not available.'
      };
      
      setError(errorMessages[event.error] || 'Speech recognition failed. Please try again.');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  };

  const getLanguageCode = (lang) => {
    const langCodes = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'hinglish': 'en-IN' // Will handle Hinglish in English recognition
    };
    return langCodes[lang] || 'en-IN';
  };

  const processVoiceInput = (text, confidence) => {
    // Clean up the transcript
    const cleanText = text.trim();
    
    if (cleanText.length < 3) {
      setError('Speech too short. Please speak more clearly.');
      return;
    }

    // Low confidence warning
    if (confidence < 0.3) {
      setError('Low confidence in speech recognition. Please speak clearly.');
      return;
    }

    // Send to parent component
    if (onVoiceInput) {
      onVoiceInput(cleanText, {
        confidence,
        language: getLanguageCode(language),
        timestamp: new Date()
      });
    }

    // Auto-clear after successful input
    setTimeout(() => {
      setTranscript('');
      setConfidence(0);
    }, 2000);
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isDisabled) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-input-container">
      {/* Voice Input Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={isDisabled}
        className={`relative p-2.5 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation ${
          isListening 
            ? 'bg-red-primary text-cream animate-pulse' 
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200 hover:text-text-primary'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <div className="flex items-center justify-center">
            <MicOff size={16} className="sm:w-5 sm:h-5" />
          </div>
        ) : (
          <Mic size={16} className="sm:w-5 sm:h-5" />
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Voice Status Display */}
      {(isListening || transcript || error) && (
        <div className="mt-2 p-3 bg-gray-50 border border-border-light rounded-lg">
          {isListening && (
            <div className="flex items-center gap-2 text-red-primary mb-2">
              <Volume2 size={16} className="animate-pulse" />
              <span className="text-sm font-medium">
                {language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
              </span>
            </div>
          )}
          
          {transcript && (
            <div className="mb-2">
              <p className="text-sm text-text-primary">
                <span className="font-medium">Heard: </span>
                "{transcript}"
              </p>
              {confidence > 0 && (
                <div className="mt-1">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          confidence > 0.7 ? 'bg-green-500' : 
                          confidence > 0.4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span>{Math.round(confidence * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <span className="font-medium">Error: </span>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Voice Input Tips */}
      {isListening && (
        <div className="mt-2 text-xs text-text-secondary bg-blue-50 p-2 rounded border border-blue-200">
          <p className="mb-1 font-medium">💡 Voice Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Speak clearly and at normal pace</li>
            <li>• Mention location and problem details</li>
            <li>• You can mix Hindi and English</li>
            <li>• Will auto-stop in 10 seconds</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 