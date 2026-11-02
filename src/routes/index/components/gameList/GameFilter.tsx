import { Fragment, useState, useRef, useEffect } from 'react';
import styles from './GameFilter.module.scss';
import { IoFunnel } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useOutsideClick } from 'hooks/useOutsideClick';

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

export interface FormatRow {
  label: string;
  casual?: FormatOption;
  competitive?: FormatOption;
}

export interface SortOption<T extends string> {
  label: string;
  value: T;
}

export interface GameFilterProps<T extends string> {
  selectedFormats: Set<string>;
  onFilterChange: (formats: Set<string>) => void;
  formatRows: Array<FormatRow>;
  includeFriendsGames: boolean;
  formatNumberMapping?: { [key: string]: string }; // Map string format to numeric format
  formatCounts?: Map<string, number>;
  sortOptions?: SortOption<T>[];
  sortValue?: T;
  onSortChange?: (value: T) => void;
}

const GameFilter = <T extends string>({
  selectedFormats,
  onFilterChange,
  formatRows,
  includeFriendsGames,
  formatNumberMapping = {},
  formatCounts,
  sortOptions,
  sortValue,
  onSortChange
}: GameFilterProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const formatOptions = formatRows.flatMap((row) =>
    [row.casual, row.competitive].filter(
      (option): option is FormatOption => !!option
    )
  );

  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  useOutsideClick(dropdownRef, () => setIsOpen(false));

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
          left: `${Math.max(16, rect.right - 370)}px`,
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

  const handleSelectAll = () => {
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

  const handleSelectNone = () => {
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

  const isFormatSelected = (format: FormatOption) =>
    format.isGroup
      ? isGroupSelected(format.groupValues)
      : selectedFormats.has(format.value) ||
        !!(
          formatNumberMapping[format.value] &&
          selectedFormats.has(formatNumberMapping[format.value])
        );

  const getFormatCount = (format: FormatOption) => {
    if (!formatCounts) return undefined;
    const values = format.isGroup ? format.groupValues ?? [] : [format.value];
    return values.reduce(
      (sum, val) =>
        sum +
        (formatCounts.get(val) ?? 0) +
        (formatNumberMapping[val]
          ? formatCounts.get(formatNumberMapping[val]) ?? 0
          : 0),
      0
    );
  };

  const selectedOptionCount = formatOptions.filter(isFormatSelected).length;
  const allFormatsSelected = selectedOptionCount === formatOptions.length;
  const isSortChanged =
    !!sortOptions?.length && sortValue !== sortOptions[0].value;
  const hasActiveFilters =
    !allFormatsSelected || !includeFriendsGames || isSortChanged;

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
        <IoFunnel className={styles.filterIcon} />
        {!allFormatsSelected && (
          <span className={styles.filterCount}>{selectedOptionCount}</span>
        )}
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
            {sortOptions && sortValue !== undefined && onSortChange && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h5 className={styles.sectionTitle}>
                    {t('GAME_FILTER.SORT')}
                  </h5>
                </div>
                <div className={styles.segmented} role="radiogroup">
                  {sortOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      role="radio"
                      aria-checked={sortValue === option.value}
                      className={`${styles.segment}${
                        sortValue === option.value
                          ? ` ${styles.segmentActive}`
                          : ''
                      }`}
                      onClick={() => onSortChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h5 className={styles.sectionTitle}>
                  {t('GAME_FILTER.FORMATS')}
                </h5>
                <div className={styles.headerActions}>
                  <button
                    type="button"
                    className={styles.headerActionBtn}
                    onClick={handleSelectAll}
                    disabled={allFormatsSelected}
                  >
                    {t('GAME_FILTER.SELECT_ALL')}
                  </button>
                  <button
                    type="button"
                    className={styles.headerActionBtn}
                    onClick={handleSelectNone}
                    disabled={selectedOptionCount === 0}
                  >
                    {t('GAME_FILTER.SELECT_NONE')}
                  </button>
                </div>
              </div>
              <div className={styles.formatGrid} role="group">
                <span />
                <span className={styles.columnHeader}>
                  {t('GAME_FILTER.CASUAL')}
                </span>
                <span className={styles.columnHeader}>
                  {t('GAME_FILTER.COMPETITIVE')}
                </span>
                {formatRows.map((row) => (
                  <Fragment key={row.label}>
                    <span className={styles.rowLabel} title={row.label}>
                      {row.label}
                    </span>
                    {[row.casual, row.competitive].map((format, ix) => {
                      if (!format) return <span key={ix} />;
                      const isChecked = isFormatSelected(format);
                      const count = getFormatCount(format);
                      return (
                        <label key={format.value} className={styles.cell}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            aria-label={format.label}
                            onChange={() =>
                              handleFormatChange(
                                format.value,
                                format.groupValues
                              )
                            }
                          />
                          {count !== undefined && (
                            <span
                              className={`${styles.cellCount}${
                                count === 0 ? ` ${styles.cellCountZero}` : ''
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameFilter;
