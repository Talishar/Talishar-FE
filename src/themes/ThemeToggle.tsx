import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { useTheme } from './ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { isSupporter } = useSupporterStatus();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleSelect = (themeId: string, isPremium: boolean) => {
    if (isPremium && !isSupporter) return;
    setTheme(themeId);
    setIsOpen(false);
  };

  const handlePremiumClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    window.location.href = TALISHAR_METAFY_URL;
  };

  return (
    <div className={styles.themeToggleContainer} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentTheme.name}</span>
        <span className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`} />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {availableThemes.map((theme) => {
            const locked = !!theme.premium && !isSupporter;
            const isSelected = theme.id === currentTheme.id;
            return (
              <li
                key={theme.id}
                role="option"
                aria-selected={isSelected}
                aria-disabled={locked}
                className={[
                  styles.option,
                  isSelected ? styles.optionSelected : '',
                  locked ? styles.optionLocked : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(theme.id, !!theme.premium)}
              >
                <span className={styles.optionName}>{theme.name}</span>
                {locked && (
                  <span
                    className={styles.lockBadge}
                    title="Metafy supporter exclusive"
                    onClick={handlePremiumClick}
                  >
                    🔒
                  </span>
                )}
              </li>
            );
          })}
          {!isSupporter && (
            <li className={styles.upgradeRow}>
              <button
                type="button"
                className={styles.upgradeButton}
                onClick={handlePremiumClick}
              >
                Unlock Custom Themes — Become a Supporter
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ThemeToggle;
