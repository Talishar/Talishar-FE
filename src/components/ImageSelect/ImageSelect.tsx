import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageSelect.module.css';

export interface ImageSelectOption {
  value: string;
  label: string;
  imageUrl?: string;
}

interface ImageSelectProps {
  options: ImageSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: 'true' | undefined;
  'aria-busy'?: boolean;
  id?: string;
}

export const ImageSelect: React.FC<ImageSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  'aria-invalid': ariaInvalid,
  'aria-busy': ariaBusy,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ImageSelectOption | undefined>(
    options.find(opt => opt.value === value)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedOption(options.find(opt => opt.value === value));
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (option: ImageSelectOption) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, option?: ImageSelectOption) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (option) {
        handleSelect(option);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  return (
    <div 
      className={`${styles.imageSelect} ${disabled ? styles.disabled : ''}`} 
      ref={containerRef}
      id={id}
    >
      <div
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''} ${ariaInvalid ? styles.invalid : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => !disabled && handleKeyDown(e)}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-busy={ariaBusy}
        aria-invalid={ariaInvalid}
      >
        {selectedOption ? (
          <div className={styles.selectedOption}>
            {selectedOption.imageUrl && (
              <img 
                src={selectedOption.imageUrl} 
                alt="" 
                className={styles.optionImage}
              />
            )}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <svg 
          className={styles.arrow} 
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none"
        >
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {isOpen && (
        <div className={styles.optionsList} role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.option} ${selectedOption?.value === option.value ? styles.selected : ''}`}
              onClick={() => handleSelect(option)}
              onKeyDown={(e) => handleKeyDown(e, option)}
              tabIndex={0}
              role="option"
              aria-selected={selectedOption?.value === option.value}
            >
              {option.imageUrl && (
                <img 
                  src={option.imageUrl} 
                  alt="" 
                  className={styles.optionImage}
                />
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
