import { useState, useRef, useEffect } from 'react';
import styles from './GameFilter.module.scss';
import { IoMdArrowDropright } from 'react-icons/io';
import { IoFunnel } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

// Utility functions for persisting filters to local storage
const FILTER_STORAGE_KEY = 'gameFilters';
const saveFiltersToStorage = (formats: Set<string>): void => {
  try {
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(Array.from(formats))
    );
  } catch {
    console.error('Failed to save filters to localStorage');
  }
};

export interface FormatOption {
  label: string;
  value: string;
  isGroup?: boolean;
  groupValues?: string[];
}

export interface GameFilterProps {
  selectedFormats: Set<string>;
  onFilterChange: (formats: Set<string>) => void;
  formatOptions: Array<FormatOption>;
  includeFriendsGames: boolean;
  formatNumberMapping?: { [key: string]: string }; // Map string format to numeric format
}

const GameFilter = ({
  selectedFormats,
  onFilterChange,
  formatOptions,
  includeFriendsGames,
  formatNumberMapping = {}
}: GameFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateDropdownPosition = () => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile, position dropdown centered on screen
        setDropdownStyle({
          top: `${rect.bottom + 8}px`,
          left: '1em',
          right: '1em',
          width: 'calc(100vw - 2em)',
          maxWidth: 'calc(100vw - 2em)'
        });
      } else {
        // On desktop, position dropdown relative to the button
        setDropdownStyle({
          top: `${rect.bottom + 8}px`,
          left: `${rect.right - 280}px`,
          maxWidth: '90vw'
        });
      }
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [isOpen]);

  // Recalculate position whenever button position might change
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    // Listen to window scroll and resize events
    const handleWindowChange = () => {
      updateDropdownPosition();
    };

    window.addEventListener('scroll', handleWindowChange, true);
    window.addEventListener('resize', handleWindowChange);

    return () => {
      window.removeEventListener('scroll', handleWindowChange, true);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [isOpen]);

  const handleFormatChange = (formatValue: string, groupValues?: string[]) => {
    const newFormats = new Set(selectedFormats);

    // If this is a group, handle all values in the group
    if (groupValues) {
      const allGroupValuesSelected = groupValues.every((val) => {
        const numericFormat = formatNumberMapping[val];
        return (
          newFormats.has(val) ||
          (numericFormat && newFormats.has(numericFormat))
        );
      });

      if (allGroupValuesSelected) {
        // Remove all group values
        groupValues.forEach((val) => {
          newFormats.delete(val);
          const numericFormat = formatNumberMapping[val];
          if (numericFormat) {
            newFormats.delete(numericFormat);
          }
        });
      } else {
        // Add all group values
        groupValues.forEach((val) => {
          newFormats.add(val);
          const numericFormat = formatNumberMapping[val];
          if (numericFormat) {
            newFormats.add(numericFormat);
          }
        });
      }
    } else {
      // Single format
      const numericFormat = formatNumberMapping[formatValue];

      // Check if BOTH the string and numeric format are selected
      const stringSelected = newFormats.has(formatValue);
      const numericSelected = numericFormat && newFormats.has(numericFormat);

      if (stringSelected || numericSelected) {
        // Remove both
        newFormats.delete(formatValue);
        if (numericFormat) {
          newFormats.delete(numericFormat);
        }
      } else {
        // Add both
        newFormats.add(formatValue);
        if (numericFormat) {
          newFormats.add(numericFormat);
        }
      }
    }
    onFilterChange(newFormats);
    saveFiltersToStorage(newFormats);
  };

  const handleResetFilters = () => {
    // Select all boxes
    const allFormats = new Set<string>();
    formatOptions.forEach((format) => {
      if (format.isGroup && format.groupValues) {
        format.groupValues.forEach((val) => {
          allFormats.add(val);
          const numericFormat = formatNumberMapping[val];
          if (numericFormat) {
            allFormats.add(numericFormat);
          }
        });
      } else {
        allFormats.add(format.value);
        const numericFormat = formatNumberMapping[format.value];
        if (numericFormat) {
          allFormats.add(numericFormat);
        }
      }
    });
    onFilterChange(allFormats);
    saveFiltersToStorage(allFormats);
  };

  const handleDeselectAll = () => {
    // Deselect all boxes
    const emptyFormats = new Set<string>();
    onFilterChange(emptyFormats);
    saveFiltersToStorage(emptyFormats);
  };

  const isGroupSelected = (groupValues?: string[]) => {
    if (!groupValues) return false;
    return groupValues.every((val) => {
      const numericFormat = formatNumberMapping[val];
      return (
        selectedFormats.has(val) ||
        (numericFormat && selectedFormats.has(numericFormat))
      );
    });
  };

  const allFormatsSelected = formatOptions.every((format) =>
    format.isGroup
      ? isGroupSelected(format.groupValues)
      : selectedFormats.has(format.value) ||
        !!(
          formatNumberMapping[format.value] &&
          selectedFormats.has(formatNumberMapping[format.value])
        )
  );
  const friendsGameEnabled = includeFriendsGames;
  const hasActiveFilters = !allFormatsSelected || !friendsGameEnabled;

  return (
    <div className={styles.filterContainer} ref={dropdownRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`${styles.filterButton}${
          hasActiveFilters ? ` ${styles.filterButtonActive}` : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title={t('GAME_FILTER.FILTER_GAMES')}
        aria-label={t('GAME_FILTER.FILTER_GAMES')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.filterIcon}>
          <IoFunnel />
        </span>
        <span className={styles.chevron}>
          <IoMdArrowDropright
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div
            className={styles.dropdown}
            style={dropdownStyle}
            role="dialog"
            aria-label={t('GAME_FILTER.FILTER_GAMES')}
          >
            <div className={styles.dropdownHeader}>
              <h5 className={styles.dropdownTitle}>
                {t('GAME_FILTER.FILTER_GAMES')}
              </h5>
              <div className={styles.headerActions}>
                <button
                  className={styles.headerActionBtn}
                  onClick={handleResetFilters}
                >
                  {t('GAME_FILTER.RESET_FILTER')}
                </button>
                <button
                  className={styles.headerActionBtn}
                  onClick={handleDeselectAll}
                >
                  {t('GAME_FILTER.UNCHECK_ALL')}
                </button>
              </div>
            </div>

            <div className={styles.checklistContainer}>
              {formatOptions.map((format) => {
                const isChecked = format.isGroup
                  ? isGroupSelected(format.groupValues)
                  : selectedFormats.has(format.value);
                return (
                  <label
                    key={format.value}
                    className={`${styles.checklistItem}${
                      isChecked ? ` ${styles.checklistItemChecked}` : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        handleFormatChange(format.value, format.groupValues)
                      }
                    />
                    <span>{format.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameFilter;
