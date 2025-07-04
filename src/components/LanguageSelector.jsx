import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1 border-2 border-ink-black bg-card hover:bg-ink-black hover:text-paper-yellow transition-all shadow-newspaper hover:shadow-none hover:translate-x-1 hover:translate-y-1"
      title={i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="font-bold uppercase text-xs tracking-wider">
        {i18n.language === 'en' ? 'EN' : 'हि'}
      </span>
    </button>
  );
};

export default LanguageSelector; 