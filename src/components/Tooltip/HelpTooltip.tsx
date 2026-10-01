import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating
} from '@floating-ui/react';
import { FaQuestion } from 'react-icons/fa';
import styles from './HelpTooltip.module.css';

interface HelpTooltipProps {
  text: string;
  placement?: 'top' | 'bottom';
}

export const HelpTooltip = ({ text, placement = 'top' }: HelpTooltipProps) => {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const tooltipId = useId();
  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate
  });

  const showTooltip = (trigger: HTMLElement) => {
    const fullscreenRoot = document.fullscreenElement;
    setPortalRoot(
      trigger.closest<HTMLDialogElement>('dialog[open]') ??
        (fullscreenRoot instanceof HTMLElement &&
        fullscreenRoot !== document.documentElement
          ? fullscreenRoot
          : document.body)
    );
    setOpen(true);
  };

  return (
    <>
      <span
        ref={refs.setReference}
        className={styles.icon}
        tabIndex={0}
        aria-label={text}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={(event) => showTooltip(event.currentTarget)}
        onMouseLeave={() => setOpen(false)}
        onFocus={(event) => showTooltip(event.currentTarget)}
        onBlur={() => setOpen(false)}
        onPointerUp={(event) => {
          if (event.pointerType === 'touch') showTooltip(event.currentTarget);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <FaQuestion aria-hidden="true" focusable="false" />
      </span>
      {open &&
        portalRoot &&
        createPortal(
          <div
            ref={refs.setFloating}
            id={tooltipId}
            role="tooltip"
            className={styles.tooltip}
            style={floatingStyles}
          >
            {text}
          </div>,
          portalRoot
        )}
    </>
  );
};
