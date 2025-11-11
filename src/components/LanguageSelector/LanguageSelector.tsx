import react, { useState } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { toast } from 'react-hot-toast';
import { LOCALE_DICTIONARY, LOCALE_FLAGS } from 'utils/multilanguage/constants';

const capitalizeFirstLetter = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const isChromiumBased = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Chrome|Chromium|Edge/.test(userAgent) && !/Firefox/.test(userAgent);
};

const LanguageSelector = () => {
  const { getLanguage, setLanguage } = useLanguageSelector();
  const [isToastShown, setIsToastShown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguage());
  const isChromium = isChromiumBased();

  const handleLanguageSelect = (event: { target: { value: any } }) => {
    const language = event.target.value;
    setLanguage(language);
    setSelectedLanguage(language);

    if (!isToastShown) {
      toast(
        'Experimental feature only for card images at this moment. Any error report it on Discord for a quick fix. Thanks.',
        {
          duration: 5000
        }
      );
      setIsToastShown(true);
    }
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
            {!isChromium && LOCALE_FLAGS[language]} {capitalizeFirstLetter(LOCALE_DICTIONARY[language])}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
