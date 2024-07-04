import react, { useState } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { LOCALE_DICTIONARY } from 'utils/multilanguage/constants';

const LanguageSelector = () => {
  const { getLanguage, setLanguage } = useLanguageSelector();
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguage());

  const handleLanguageSelect = (event: { target: { value: any } }) => {
    const language = event.target.value;
    setLanguage(language);
    setSelectedLanguage(language);
  };

  return (
    <div>
      <select onChange={handleLanguageSelect} defaultValue={selectedLanguage}>
        {Object.keys(LOCALE_DICTIONARY).map((language, index) => (
          <option
            key={`${language}-${index}`}
            className="dropdown-item"
            value={language}
          >
            {LOCALE_DICTIONARY[language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
