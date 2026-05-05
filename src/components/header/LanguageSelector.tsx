import React, { useState, useRef, useEffect } from 'react';
import { BsTranslate } from 'react-icons/bs';
import styles from './LanguageSelector.module.scss';
import { useTranslation } from 'react-i18next';
import {
  I18N_LANGUAGE_LABELS,
  I18N_SUPPORTED_LANGUAGE_CODES
} from '../../constants/i18nSupportedLanguages';

const LanguageSelector = ({ inDropdown = false }: { inDropdown?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Initial stuff to allow the lang to change
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <li className={`${styles.socialDropdown}${inDropdown ? ` ${styles.inDropdown}` : ''}`} ref={dropdownRef}>
      {inDropdown ? (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
          aria-label={t('HEADER.LANGUAGE_SELECTOR.LANGUAGES')}
        >
          <BsTranslate />{' '}
          <span>
            {t('HEADER.LANGUAGE_SELECTOR.LANGUAGE')}
          </span>
        </a>
      ) : (
        <button
          className={styles.dropdownToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('HEADER.LANGUAGE_SELECTOR.LANGUAGES')}
        >
	  { inDropdown ? 
            <BsTranslate /> : '' }
          <span className={styles.label}>
            {t('HEADER.LANGUAGE_SELECTOR.LANGUAGE')}
          </span>
        </button>
      )}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {I18N_SUPPORTED_LANGUAGE_CODES.map((code) => (
            <a
              key={code}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                changeLanguage(code);
                setIsOpen(false);
              }}
              className={styles.socialLink}
            >
              {I18N_LANGUAGE_LABELS[code]}
            </a>
          ))}
        </div>
      )}
    </li>
  );
};

export default LanguageSelector;
