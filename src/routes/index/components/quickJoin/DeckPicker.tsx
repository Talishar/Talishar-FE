import React, { useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ImageSelectOption } from 'components/ImageSelect';
import { cropFocusStyle } from 'utils/cropImages';
import styles from './DeckPicker.module.css';

export interface DeckPickerMastery {
  percent: number;
  label: string;
}

interface DeckPickerProps {
  options: ImageSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  recentKey: string;
  labelledBy?: string;
  disabled?: boolean;
  mastery?: DeckPickerMastery | null;
}

const readRecents = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

const writeRecents = (key: string, list: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    return;
  }
};

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const DeckArt = ({ option }: { option: ImageSelectOption }) =>
  option.imageUrl ? (
    <img
      src={option.imageUrl}
      alt=""
      draggable={false}
      className={styles.art}
      style={cropFocusStyle(option.imageFocusX)}
    />
  ) : null;

const DeckPicker = ({
  options,
  value,
  onChange,
  placeholder,
  recentKey,
  labelledBy,
  disabled = false,
  mastery
}: DeckPickerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<string[]>(() =>
    readRecents(recentKey)
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusSearchOnOpen = useRef(false);
  const lastPointerType = useRef('');
  const menuId = useId();
  const nameId = useId();
  const selected = options.find((option) => option.value === value);
  const canOpen = !disabled && options.length > 0;

  useEffect(() => {
    if (!value) return;
    setRecents((prev) => {
      const next = [value, ...prev.filter((item) => item !== value)].slice(
        0,
        4
      );
      if (sameList(next, prev)) return prev;
      writeRecents(recentKey, next);
      return next;
    });
  }, [value, recentKey]);

  useEffect(() => {
    if (!isOpen) return;
    if (focusSearchOnOpen.current) searchRef.current?.focus();
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const others = options.filter((option) => option.value !== value);
  const minis = [
    ...recents
      .map((item) => others.find((option) => option.value === item))
      .filter((option): option is ImageSelectOption => !!option),
    ...others
  ]
    .filter((option, index, list) => list.indexOf(option) === index)
    .slice(0, 3);
  const hiddenCount = options.length - (selected ? 1 : 0) - minis.length;

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(needle) ||
          !!option.description?.toLowerCase().includes(needle)
      )
    : options;

  const openPopover = (focusSearch: boolean) => {
    focusSearchOnOpen.current = focusSearch;
    setQuery('');
    setIsOpen(true);
  };

  const togglePopover = (event: React.MouseEvent) => {
    if (!canOpen) return;
    if (isOpen) setIsOpen(false);
    else openPopover(event.detail === 0 || lastPointerType.current === 'mouse');
  };

  const recordPointerType = (event: React.PointerEvent) => {
    lastPointerType.current = event.pointerType;
  };

  const close = () => {
    setIsOpen(false);
    bannerRef.current?.focus();
  };

  const pick = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        optionRefs.current[0]?.focus();
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

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const current = optionRefs.current.findIndex(
      (el) => el === document.activeElement
    );
    const focusAt = (index: number) =>
      optionRefs.current[(index + filtered.length) % filtered.length]?.focus();
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        focusAt(current + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        focusAt(current - 1);
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(filtered.length - 1);
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
      openPopover(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, selected && styles.picked)}
    >
      <button
        ref={bannerRef}
        type="button"
        className={classNames(
          styles.banner,
          selected ? styles.square : styles.compact,
          isOpen && styles.open
        )}
        onClick={togglePopover}
        onPointerDown={recordPointerType}
        onKeyDown={handleBannerKeyDown}
        disabled={!canOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${nameId}` : nameId}
      >
        {selected ? (
          <DeckArt option={selected} />
        ) : (
          <>
            <span className={styles.info}>
              <span id={nameId} className={styles.name}>
                {placeholder}
              </span>
            </span>
            {canOpen && (
              <span className={styles.chevron} aria-hidden="true">
                <FaChevronDown size={11} />
              </span>
            )}
          </>
        )}
      </button>
      {selected && (
        <div className={styles.side}>
          <span id={nameId} className={styles.name}>
            {selected.label}
          </span>
          {selected.description && (
            <span className={styles.description}>{selected.description}</span>
          )}
          {mastery && (
            <span className={styles.mastery}>
              <span className={styles.track} aria-hidden="true">
                <i style={{ width: `${mastery.percent}%` }} />
              </span>
              <span className={styles.masteryText}>{mastery.label}</span>
            </span>
          )}
          <div className={styles.minis}>
            {minis.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.mini}
                title={option.label}
                aria-label={option.label}
                onClick={() => pick(option.value)}
              >
                <DeckArt option={option} />
              </button>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                className={styles.moreTile}
                aria-label={t('JOIN.ALL_DECKS', { count: options.length })}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={togglePopover}
                onPointerDown={recordPointerType}
              >
                {t('JOIN.MORE_DECKS', { number: hiddenCount })}
              </button>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className={styles.popover}>
          <input
            ref={searchRef}
            type="search"
            className={styles.search}
            placeholder={t('JOIN.SEARCH_DECKS')}
            aria-label={t('JOIN.SEARCH_DECKS')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <div
            id={menuId}
            role="listbox"
            aria-labelledby={labelledBy}
            className={styles.grid}
            onKeyDown={handleMenuKeyDown}
          >
            {filtered.map((option, index) => {
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
                  <span className={styles.thumb}>
                    <DeckArt option={option} />
                  </span>
                  <span className={styles.caption}>{option.label}</span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className={styles.empty}>{t('JOIN.NO_DECK_MATCH')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeckPicker;
