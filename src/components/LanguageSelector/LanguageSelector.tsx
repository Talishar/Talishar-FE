import react, { useEffect, useRef, useState } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { toast } from 'react-hot-toast';
import { LOCALE_DICTIONARY, LOCALE_FLAGS } from 'utils/multilanguage/constants';
import styles from './LanguageSelector.module.css';

const capitalizeFirstLetter = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

const isChromiumBased = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Chrome|Chromium|Edge/.test(userAgent) && !/Firefox/.test(userAgent);
};

const LanguageSelector = () => {
  const { getLanguage, setLanguage } = useLanguageSelector();
  const [isToastShown, setIsToastShown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isChromium = isChromiumBased();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (language: string) => {
    setLanguage(language);
    setSelectedLanguage(language);
    setIsOpen(false);

    if (!isToastShown) {
      toast(
        'Experimental feature only for card images at this moment. Any error report it on Discord for a quick fix. Thanks.',
        { duration: 5000 }
      );
      setIsToastShown(true);
    }
  };

  const currentLabel = `${!isChromium ? (LOCALE_FLAGS[selectedLanguage] ?? '') + ' ' : ''}${capitalizeFirstLetter(LOCALE_DICTIONARY[selectedLanguage] ?? selectedLanguage)}`;

  return (
    <div className={styles.languageSelectorContainer} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentLabel}</span>
        <span className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`} />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {Object.keys(LOCALE_DICTIONARY).map((language, index) => {
            const isSelected = language === selectedLanguage;
            const label = `${!isChromium ? (LOCALE_FLAGS[language] ?? '') + ' ' : ''}${capitalizeFirstLetter(LOCALE_DICTIONARY[language])}`;
            return (
              <li
                key={`${language}-${index}`}
                role="option"
                aria-selected={isSelected}
                className={[styles.option, isSelected ? styles.optionSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(language)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
