import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-cream text-text-primary">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-serif font-black text-5xl tracking-tight mb-2">
            ASK SARKAR
          </h1>
          <p className="text-sm tracking-extra-wide uppercase text-text-secondary">
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

        {/* Main Content */}
        {mode === 'chat' ? (
          <div className="bg-white/50 border border-border-light p-8 rounded-lg">
            <h2 className="font-serif text-2xl mb-4">{t('chatWithAI')}</h2>
            <p className="text-text-secondary mb-6">{t('chatDescription')}</p>
            <ChatInterface 
              onComplete={handleChatComplete}
              existingFormData={formData}
            />
          </div>
        ) : (
          <div className="bg-white/50 border border-border-light p-8 rounded-lg">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-2xl">RTI Application Form</h2>
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
        )}
      </div>
    </div>
  );
}

export default App;
