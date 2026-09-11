import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageSelect.module.css';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const DROPDOWN_GAP = 4;
const DROPDOWN_MARGIN = 8;
const DROPDOWN_MIN_HEIGHT = 120;

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
  'aria-label'?: string;
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
  'aria-label': ariaLabel,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  // The list is portalled to the body so a scrolling panel around the select
  // cannot clip it; that means its position has to follow the trigger.
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_MARGIN;
    const spaceAbove = rect.top - DROPDOWN_MARGIN;
    const contentHeight = listRef.current?.scrollHeight ?? 0;
    const openUpwards = contentHeight > spaceBelow && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      openUpwards ? spaceAbove : spaceBelow,
      DROPDOWN_MIN_HEIGHT
    );
    const height = contentHeight
      ? Math.min(contentHeight, maxHeight)
      : maxHeight;
    setPosition({
      top: openUpwards
        ? rect.top - DROPDOWN_GAP - height
        : rect.bottom + DROPDOWN_GAP,
      left: rect.left,
      width: rect.width,
      maxHeight
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, options, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !listRef.current?.contains(target)
      ) {
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
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    option?: ImageSelectOption
  ) => {
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
    >
      <div
        id={id}
        ref={triggerRef}
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''} ${
          ariaInvalid ? styles.invalid : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => !disabled && handleKeyDown(e)}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-busy={ariaBusy}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
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
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={listRef}
            className={styles.optionsList}
            role="listbox"
            data-select-id={id}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: position?.width,
              maxHeight: position?.maxHeight,
              visibility: position ? 'visible' : 'hidden'
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${
                  selectedOption?.value === option.value ? styles.selected : ''
                }`}
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
          </div>,
          document.body
        )}
    </div>
  );
};
