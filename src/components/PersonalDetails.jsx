import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

const PersonalDetails = ({ formData, onChange, onNext }) => {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isValid = formData.name && formData.fatherHusbandName && formData.address;

  return (
    <div className="space-y-6 fade-in">
      <div className="mobile-form space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t('name')} <span className="text-red-primary">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="form-input"
            placeholder={t('enterYourName') || "Enter your full name"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t('fatherHusbandName')} <span className="text-red-primary">*</span>
          </label>
          <input
            type="text"
            value={formData.fatherHusbandName || ''}
            onChange={(e) => handleChange('fatherHusbandName', e.target.value)}
            className="form-input"
            placeholder={t('enterFatherHusbandName') || "Enter father's/husband's name"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t('address')} <span className="text-red-primary">*</span>
          </label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={4}
            className="form-input resize-none"
            placeholder={t('enterYourAddress') || "Enter your complete address"}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t border-border-light space-y-4 sm:space-y-0">
        <div className="text-sm text-text-secondary text-center sm:text-left">
          Step 1 of 6
        </div>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {t('next') || 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails; 