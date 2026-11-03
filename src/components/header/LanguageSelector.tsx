import { useState, useRef } from 'react';
import { BsCheck2, BsChevronDown, BsGlobe2 } from 'react-icons/bs';
import styles from './LanguageSelector.module.scss';
import { useTranslation } from 'react-i18next';
import {
  I18N_LANGUAGE_LABELS,
  I18N_SUPPORTED_LANGUAGE_CODES,
  I18nSupportedLanguageCode
} from '../../constants/i18nSupportedLanguages';
import { useOutsideClick } from 'hooks/useOutsideClick';

type LanguageSelectorVariant = 'bar' | 'menu' | 'mobile';

const isSupported = (code?: string): code is I18nSupportedLanguageCode =>
  (I18N_SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(code ?? '');

const LanguageSelector = ({
  variant = 'bar'
}: {
  variant?: LanguageSelectorVariant;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const { t, i18n } = useTranslation();

  const resolved = i18n.resolvedLanguage ?? i18n.language;
  const current: I18nSupportedLanguageCode = isSupported(resolved)
    ? resolved
    : 'en';

  useOutsideClick(dropdownRef, () => setIsOpen(false), { enabled: isOpen });

  return (
    <li
      className={`${styles.languageSelector} ${styles[variant]}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${t('HEADER.LANGUAGE_SELECTOR.LANGUAGE')}: ${
          I18N_LANGUAGE_LABELS[current]
        }`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <BsGlobe2 className={styles.globe} aria-hidden="true" />
        {variant !== 'bar' && (
          <span className={styles.label}>
            {t('HEADER.LANGUAGE_SELECTOR.LANGUAGE')}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className={styles.panel}
          role="menu"
          aria-label={t('HEADER.LANGUAGE_SELECTOR.LANGUAGES')}
        >
          {I18N_SUPPORTED_LANGUAGE_CODES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === current}
              lang={code}
              className={styles.option}
              onClick={() => {
                i18n.changeLanguage(code);
                setIsOpen(false);
              }}
            >
              <span>{I18N_LANGUAGE_LABELS[code]}</span>
              {code === current && <BsCheck2 aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </li>
  );
};

export default LanguageSelector;
