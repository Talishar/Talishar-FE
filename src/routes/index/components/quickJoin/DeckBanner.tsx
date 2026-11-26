import React, { useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { ImageSelectOption } from 'components/ImageSelect';
import { cropFocusStyle } from 'utils/cropImages';
import styles from './DeckBanner.module.css';

export interface DeckBannerMastery {
  percent: number;
  label: string;
}

interface DeckBannerProps {
  options: ImageSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  labelledBy?: string;
  disabled?: boolean;
  mastery?: DeckBannerMastery | null;
}

const DeckBanner = ({
  options,
  value,
  onChange,
  placeholder,
  labelledBy,
  disabled = false,
  mastery
}: DeckBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const nameId = useId();
  const selected = options.find((option) => option.value === value);
  const canOpen = !disabled && options.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    optionRefs.current[Math.max(0, selectedIndex)]?.focus();
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, options, value]);

  const close = () => {
    setIsOpen(false);
    bannerRef.current?.focus();
  };

  const pick = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const current = optionRefs.current.findIndex(
      (el) => el === document.activeElement
    );
    const focusAt = (index: number) =>
      optionRefs.current[
        (index + options.length) % options.length
      ]?.focus();
    switch (event.key) {
      case 'ArrowDown':
        focusAt(current + 1);
        break;
      case 'ArrowUp':
        focusAt(current - 1);
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(options.length - 1);
        break;
      case 'Escape':
        close();
        break;
      case 'Tab':
        setIsOpen(false);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  const handleBannerKeyDown = (event: React.KeyboardEvent) => {
    if (!canOpen) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const hasArt = !!selected?.imageUrl;

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={bannerRef}
        type="button"
        className={classNames(
          styles.banner,
          !hasArt && styles.compact,
          isOpen && styles.open
        )}
        onClick={() => canOpen && setIsOpen((open) => !open)}
        onKeyDown={handleBannerKeyDown}
        disabled={!canOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${nameId}` : nameId}
      >
        {hasArt && (
          <>
            <img
              src={selected!.imageUrl}
              alt=""
              draggable={false}
              className={styles.art}
              style={cropFocusStyle(selected!.imageFocusX)}
            />
            <span className={styles.scrim} aria-hidden="true" />
          </>
        )}
        <span className={styles.info}>
          <span id={nameId} className={styles.name}>
            {selected?.label ?? placeholder}
          </span>
          {hasArt && mastery && (
            <span className={styles.mastery}>
              <span className={styles.track} aria-hidden="true">
                <i style={{ width: `${mastery.percent}%` }} />
              </span>
              <span className={styles.masteryText}>{mastery.label}</span>
            </span>
          )}
        </span>
        {canOpen && (
          <span className={styles.chevron} aria-hidden="true">
            <FaChevronDown size={11} />
          </span>
        )}
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="listbox"
          aria-labelledby={labelledBy}
          className={styles.menu}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                className={classNames(
                  styles.option,
                  isSelected && styles.optionSelected
                )}
                onClick={() => pick(option.value)}
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt=""
                    draggable={false}
                    className={styles.thumb}
                    style={cropFocusStyle(option.imageFocusX)}
                  />
                ) : (
                  <span className={styles.thumb} aria-hidden="true" />
                )}
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && (
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <FaCheck size={12} className={styles.check} aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeckBanner;
