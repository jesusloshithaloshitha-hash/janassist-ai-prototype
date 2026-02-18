
import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-4 bg-white shadow-sm border-b sticky top-0 z-10">
      {Object.values(Language).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentLanguage === lang
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
