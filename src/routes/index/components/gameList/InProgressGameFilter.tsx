import { useState, useRef, useEffect } from 'react';
import styles from './InProgressGameFilter.module.scss';
import { IoMdArrowDropright } from 'react-icons/io';
import { IoFunnel } from "react-icons/io5";

export interface FormatOption {
  label: string;
  value: string;
  isGroup?: boolean;
  groupValues?: string[];
}

export interface InProgressGameFilterProps {
  selectedFormats: Set<string>;
  onFilterChange: (formats: Set<string>) => void;
  formatOptions: Array<FormatOption>;
  includeFriendsGames: boolean;
  onFriendsGamesChange: (include: boolean) => void;
  formatNumberMapping?: { [key: string]: string }; // Map string format to numeric format
}

const InProgressGameFilter = ({
  selectedFormats,
  onFilterChange,
  formatOptions,
  includeFriendsGames,
  onFriendsGamesChange,
  formatNumberMapping = {},
}: InProgressGameFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 280}px`,
        maxWidth: '90vw',
      });
    }
  }, [isOpen]);

  const handleFormatChange = (formatValue: string, groupValues?: string[]) => {
    const newFormats = new Set(selectedFormats);
    
    // If this is a group, handle all values in the group
    if (groupValues) {
      const allGroupValuesSelected = groupValues.every(val => {
        const numericFormat = formatNumberMapping[val];
        return newFormats.has(val) || (numericFormat && newFormats.has(numericFormat));
      });
      
      if (allGroupValuesSelected) {
        // Remove all group values
        groupValues.forEach(val => {
          newFormats.delete(val);
          const numericFormat = formatNumberMapping[val];
          if (numericFormat) {
            newFormats.delete(numericFormat);
          }
        });
      } else {
        // Add all group values
        groupValues.forEach(val => {
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
  };

  const handleResetFilters = () => {
    // Select all boxes
    const allFormats = new Set<string>();
    formatOptions.forEach((format) => {
      if (format.isGroup && format.groupValues) {
        format.groupValues.forEach(val => {
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
  };

  const handleFriendsGamesChange = () => {
    onFriendsGamesChange(!includeFriendsGames);
  };

  const isGroupSelected = (groupValues?: string[]) => {
    if (!groupValues) return false;
    return groupValues.every(val => {
      const numericFormat = formatNumberMapping[val];
      return selectedFormats.has(val) || (numericFormat && selectedFormats.has(numericFormat));
    });
  };

  const defaultFormats = formatOptions.map(f => f.value);
  const allFormatsSelected = selectedFormats.size === formatOptions.length;
  const friendsGameEnabled = includeFriendsGames;
  const hasActiveFilters = !allFormatsSelected || !friendsGameEnabled;

  return (
    <div className={styles.filterContainer} ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={styles.filterButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Filter Games in Progress"
      >
        <span className={styles.filterIcon}>
          <IoFunnel />
        </span>
        <span className={styles.chevron}>
          <IoMdArrowDropright
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} style={dropdownStyle}>
          <div className={styles.dropdownHeader}>
            <h5 className={styles.dropdownTitle}>Filter Games</h5>
          </div>

          <div className={styles.checklistContainer}>
            {/* Format Options */}
            {formatOptions.map((format) => (
              <label key={format.value} className={styles.checklistItem}>
                <input
                  type="checkbox"
                  checked={format.isGroup ? isGroupSelected(format.groupValues) : selectedFormats.has(format.value)}
                  onChange={() => handleFormatChange(format.value, format.groupValues)}
                />
                <span>{format.label}</span>
              </label>
            ))}
          </div>

          <button className={styles.resetButton} onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default InProgressGameFilter;
