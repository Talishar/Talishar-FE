import React, { useState, useRef, useEffect } from 'react';
import styles from './Filter.module.css';
import { useTranslation } from 'react-i18next';

const Filter = ({
  setHeroFilter,
  heroOptions,
  heroCounts
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
  heroOptions: { value: string; label: string }[];
  heroCounts?: Map<string, number>;
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const heroMap = heroOptions.reduce((acc, hero) => {
    if (!acc[hero.label]) acc[hero.label] = [];
    acc[hero.label].push(hero.value);
    return acc;
  }, {} as Record<string, string[]>);

  const getGroupCount = (label: string): number => {
    if (!heroCounts) return 0;
    return (heroMap[label] ?? []).reduce(
      (sum, id) => sum + (heroCounts.get(id) ?? 0),
      0
    );
  };

  const allLabels = Object.keys(heroMap).sort((a, b) => {
    const diff = getGroupCount(b) - getGroupCount(a);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  const query = inputValue.trim();
  const filteredLabels = query === ''
    ? allLabels
    : allLabels.filter((label) =>
        label.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    if (val.trim() === '') {
      setHeroFilter([]);
    }
  };

  const handleSelectLabel = (label: string) => {
    setInputValue(label);
    setHeroFilter(heroMap[label]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    setHeroFilter([]);
    setIsOpen(false);
  };

  return (
    <div className={styles.comboContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.filterInput}
          placeholder={t('FILTER.HERO_FILTER')}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        {inputValue && (
          <button className={styles.clearButton} onMouseDown={handleClear} tabIndex={-1}>
            ✕
          </button>
        )}
      </div>
      {isOpen && filteredLabels.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredLabels.map((label) => {
            const count = getGroupCount(label);
            return (
              <li
                key={label}
                className={styles.dropdownItem}
                onMouseDown={() => handleSelectLabel(label)}
              >
                <span className={styles.heroLabel}>{label}</span>
                <span className={`${styles.heroCount}${count === 0 ? ` ${styles.heroCountZero}` : ''}`}>
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Filter;
