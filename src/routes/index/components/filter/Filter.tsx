import React, { useState, useRef } from 'react';
import styles from './Filter.module.css';
import { useTranslation } from 'react-i18next';
import { useOutsideClick } from 'hooks/useOutsideClick';
import { generateCroppedImageUrl } from 'utils/cropImages';

const Filter = ({
  selectedLabel,
  onSelectLabel,
  heroOptions,
  heroCounts
}: {
  selectedLabel: string;
  onSelectLabel: (label: string) => void;
  heroOptions: { value: string; label: string }[];
  heroCounts?: Map<string, number>;
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(selectedLabel);
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
  const filteredLabels =
    query === '' || query === selectedLabel
      ? allLabels
      : allLabels.filter((label) =>
          label.toLowerCase().includes(query.toLowerCase())
        );

  useOutsideClick(containerRef, () => {
    setIsOpen(false);
    setInputValue(selectedLabel);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    if (val.trim() === '') {
      onSelectLabel('');
    }
  };

  const handleSelectLabel = (label: string) => {
    setInputValue(label);
    onSelectLabel(label);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onSelectLabel('');
    setIsOpen(false);
  };

  return (
    <div className={styles.comboContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={`${styles.filterInput}${
            selectedLabel ? ` ${styles.filterInputActive}` : ''
          }`}
          placeholder={t('FILTER.HERO_FILTER')}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={(e) => {
            e.target.select();
            setIsOpen(true);
          }}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            className={styles.clearButton}
            onMouseDown={handleClear}
            aria-label={t('FILTER.CLEAR')}
            tabIndex={-1}
          >
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
                className={`${styles.dropdownItem}${
                  count === 0 ? ` ${styles.dropdownItemZero}` : ''
                }`}
                onMouseDown={() => handleSelectLabel(label)}
              >
                <img
                  className={styles.heroThumb}
                  src={generateCroppedImageUrl(heroMap[label][0])}
                  alt=""
                  loading="lazy"
                />
                <span className={styles.heroLabel}>{label}</span>
                <span className={styles.heroCount}>{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Filter;
