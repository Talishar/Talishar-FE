import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaCaretDown } from 'react-icons/fa';
import classNames from 'classnames';
import Button from 'features/Button';
import styles from '../PlayerInputPopUp.module.css';

interface SplitButtonProps {
  buttons: Button[];
  onClickButton: (button: Button) => void;
  onHint?: (hint?: string) => void;
}

interface MenuPosition {
  left: number;
  top?: number;
  bottom?: number;
}

export const SplitButton = ({
  buttons,
  onClickButton,
  onHint
}: SplitButtonProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [main, ...rest] = buttons;

  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    setPosition(
      spaceBelow >= menuHeight + 8 || spaceBelow >= rect.top
        ? { left: rect.left, top: rect.bottom + 4 }
        : { left: rect.left, bottom: window.innerHeight - rect.top + 4 }
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (!main) return null;

  const hintProps = (button: Button) => ({
    'aria-description': button.tooltip || undefined,
    onMouseEnter: () => onHint?.(button.tooltip),
    onMouseLeave: () => onHint?.(undefined),
    onFocus: () => onHint?.(button.tooltip),
    onBlur: () => onHint?.(undefined)
  });

  const submit = (event: React.MouseEvent, button: Button) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    onClickButton(button);
  };

  return (
    <div className={styles.splitButton} ref={containerRef}>
      <button
        type="button"
        className={classNames(styles.buttonDiv, styles.splitButtonMain, {
          [styles.splitButtonMainOnly]: rest.length === 0
        })}
        {...hintProps(main)}
        onClick={(event) => submit(event, main)}
      >
        {main.caption}
      </button>
      {rest.length > 0 ? (
        <button
          type="button"
          className={classNames(styles.buttonDiv, styles.splitButtonToggle, {
            [styles.splitButtonToggleOpen]: open
          })}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t('PLAYER_INPUT.MORE_CHOICES')}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen((isOpen) => !isOpen);
          }}
        >
          <FaCaretDown aria-hidden="true" />
        </button>
      ) : null}
      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className={styles.splitButtonMenu}
              style={{
                left: position?.left ?? 0,
                top: position?.top,
                bottom: position?.bottom,
                visibility: position ? 'visible' : 'hidden'
              }}
            >
              {rest.map((button) => (
                <button
                  key={`${button.mode}-${button.buttonInput}`}
                  type="button"
                  role="menuitem"
                  className={styles.splitButtonItem}
                  {...hintProps(button)}
                  onClick={(event) => submit(event, button)}
                >
                  {button.caption}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
