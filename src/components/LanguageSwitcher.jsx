import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'ar'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;
