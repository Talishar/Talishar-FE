import React, { useId, useRef } from 'react';
import classNames from 'classnames';
import { ImageSelectOption } from 'components/ImageSelect';
import { cropFocusStyle } from 'utils/cropImages';
import styles from './BotDeckPicker.module.css';

interface BotDeckPickerProps {
  id?: string;
  label: string;
  options: ImageSelectOption[];
  value?: string;
  onChange: (value: string) => void;
}

const LABEL_WITH_FORMAT = /^(.+?)\s*[(（]([^()（）]+)[)）]$/;

const splitLabel = (label: string): { name: string; format?: string } => {
  const match = LABEL_WITH_FORMAT.exec(label);
  return match ? { name: match[1], format: match[2] } : { name: label };
};

export const BotDeckPicker: React.FC<BotDeckPickerProps> = ({
  id,
  label,
  options,
  value,
  onChange
}) => {
  const labelId = useId();
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const focusableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const moveTo = (index: number) => {
    const next = (index + options.length) % options.length;
    onChange(options[next].value);
    tileRefs.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        moveTo(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        moveTo(index - 1);
        break;
      case 'Home':
        moveTo(0);
        break;
      case 'End':
        moveTo(options.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div className={styles.picker}>
      <span id={labelId} className={styles.title}>
        {label}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={labelId}
        className={styles.grid}
        style={{ '--tile-count': options.length } as React.CSSProperties}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          const { name, format } = splitLabel(option.label);
          return (
            <button
              key={option.value}
              ref={(el) => {
                tileRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              tabIndex={index === focusableIndex ? 0 : -1}
              className={classNames(styles.tile, isSelected && styles.selected)}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {option.imageUrl && (
                <img
                  src={option.imageUrl}
                  alt=""
                  draggable={false}
                  className={styles.portrait}
                  style={cropFocusStyle(option.imageFocusX)}
                />
              )}
              <span className={styles.caption} aria-hidden="true">
                <span className={styles.name}>{name}</span>
                {format && <span className={styles.format}>{format}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
