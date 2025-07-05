import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, MessageCircle, FileText } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import PersonalDetails from './components/PersonalDetails';
import DepartmentDetails from './components/DepartmentDetails';
import InformationSought from './components/InformationSought';
import DeliveryOptions from './components/DeliveryOptions';
import FeeDetails from './components/FeeDetails';
import PDFPreview from './components/PDFPreview';
import './i18n/config';

function App() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('chat');
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fatherHusbandName: '',
    address: '',
    state: '',
    department: '',
    pio: null,
    informationRequired: '',
    dateRangeStart: '',
    dateRangeEnd: '',
    deliveryMethod: 'post',
    deliveryAddress: '',
    feeType: 'regular',
    isBelowPovertyLine: false,
    language: 'en'
  });

  const steps = [
    { id: 'personal', title: t('personalDetails'), component: PersonalDetails },
    { id: 'department', title: t('departmentDetails'), component: DepartmentDetails },
    { id: 'information', title: t('informationSought'), component: InformationSought },
    { id: 'delivery', title: t('deliveryOptions'), component: DeliveryOptions },
    { id: 'fee', title: t('feeDetails'), component: FeeDetails },
    { id: 'preview', title: t('preview'), component: PDFPreview }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (data) => {
    setFormData({ ...formData, ...data });
  };

  const handleChatComplete = (chatFormData) => {
    setFormData({ ...formData, ...chatFormData });
    setMode('form');
    setCurrentStep(5); // Go directly to preview
  };

  const handleSwitchToManual = () => {
    setMode('form');
    setCurrentStep(0); // Start from the beginning of the form
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    setMobileMenuOpen(false);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream text-text-primary">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-border-light sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="font-serif font-bold text-xl">
                ASK SARKAR
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Globe size={20} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-border-light">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleModeChange('chat')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    mode === 'chat' 
                      ? 'bg-red-primary text-cream' 
                      : 'bg-white border border-border-light text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <MessageCircle size={18} />
                  <span className="text-sm font-medium">AI Assistant</span>
                </button>
                <button
                  onClick={() => handleModeChange('form')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    mode === 'form' 
                      ? 'bg-red-primary text-cream' 
                      : 'bg-white border border-border-light text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <FileText size={18} />
                  <span className="text-sm font-medium">Manual Form</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="font-serif font-black text-3xl lg:text-5xl tracking-tight mb-2">
              ASK SARKAR
            </h1>
            <p className="text-xs lg:text-sm tracking-extra-wide uppercase text-text-secondary">
              Empowering Citizens with Information.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border-light mb-6"></div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode('chat')}
                className={`text-sm tracking-wider uppercase transition-colors ${
                  mode === 'chat' 
                    ? 'text-red-primary font-medium' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                AI Assistant
              </button>
              <span className="text-text-secondary">|</span>
              <button
                onClick={() => setMode('form')}
                className={`text-sm tracking-wider uppercase transition-colors ${
                  mode === 'form' 
                    ? 'text-red-primary font-medium' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Manual Form
              </button>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="text-sm tracking-wider uppercase text-text-secondary hover:text-text-primary"
            >
              {i18n.language === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pb-8">
        {mode === 'chat' ? (
          <div className="bg-white/50 border border-border-light rounded-lg overflow-hidden">
            <div className="p-4 lg:p-8">
              <div className="mb-4 lg:mb-6">
                <h2 className="font-serif text-xl lg:text-2xl mb-2">{t('chatWithAI')}</h2>
                <p className="text-text-secondary text-sm lg:text-base">{t('chatDescription')}</p>
              </div>
              <ChatInterface 
                onComplete={handleChatComplete}
                existingFormData={formData}
                onSwitchToManual={handleSwitchToManual}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/50 border border-border-light rounded-lg overflow-hidden">
            <div className="p-4 lg:p-8">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <h2 className="font-serif text-xl lg:text-2xl">RTI Application Form</h2>
                  <span className="text-sm text-text-secondary">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-cream-dark rounded-full h-2">
                  <div 
                    className="bg-red-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Form Component */}
              <CurrentStepComponent
                formData={formData}
                onChange={handleFormDataChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirstStep={currentStep === 0}
                isLastStep={currentStep === steps.length - 1}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
