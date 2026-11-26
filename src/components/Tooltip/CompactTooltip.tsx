import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating
} from '@floating-ui/react';
import styles from './CompactTooltip.module.css';

const tooltipAttribute = 'data-compact-tooltip';

const getTrigger = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLElement>(`[${tooltipAttribute}]`)
    : null;

const CompactTooltip = () => {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [text, setText] = useState('');
  const id = useId();
  const { refs, floatingStyles, isPositioned } = useFloating({
    open: !!trigger && !!text,
    elements: { reference: trigger },
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate
  });

  useEffect(() => {
    const show = (event: PointerEvent | FocusEvent) => {
      const target = getTrigger(event.target);
      if (target && target !== getTrigger(event.relatedTarget)) {
        setText(target.getAttribute(tooltipAttribute) ?? '');
        setTrigger(target);
      }
    };
    const hide = (event: PointerEvent | FocusEvent) => {
      const target = getTrigger(event.target);
      if (target && target !== getTrigger(event.relatedTarget)) {
        setTrigger((current) => (current === target ? null : current));
      }
    };
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTrigger(null);
    };
    const dismissOnClick = (event: MouseEvent) => {
      const target = getTrigger(event.target);
      setTrigger((current) => (current === target ? current : null));
    };

    document.addEventListener('pointerover', show);
    document.addEventListener('pointerout', hide);
    document.addEventListener('focusin', show);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', dismiss);
    document.addEventListener('click', dismissOnClick);
    return () => {
      document.removeEventListener('pointerover', show);
      document.removeEventListener('pointerout', hide);
      document.removeEventListener('focusin', show);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('click', dismissOnClick);
    };
  }, []);

  useEffect(() => {
    if (!trigger) return;
    const observer = new MutationObserver(() => {
      setText(trigger.getAttribute(tooltipAttribute) ?? '');
    });
    observer.observe(trigger, { attributeFilter: [tooltipAttribute] });
    return () => observer.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (!trigger || !text) return;
    const described =
      trigger instanceof HTMLLabelElement
        ? trigger.control ?? trigger
        : trigger;
    if (described.getAttribute('aria-label') === text) return;

    const getDescriptions = () =>
      (described.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean);
    described.setAttribute(
      'aria-describedby',
      [...getDescriptions(), id].join(' ')
    );
    return () => {
      const descriptions = getDescriptions().filter(
        (description) => description !== id
      );
      if (descriptions.length) {
        described.setAttribute('aria-describedby', descriptions.join(' '));
      } else {
        described.removeAttribute('aria-describedby');
      }
    };
  }, [id, text, trigger]);

  if (!trigger?.isConnected || !text) return null;
  const fullscreen = document.fullscreenElement;
  const portalRoot =
    trigger.closest('dialog[open]') ??
    (fullscreen !== document.documentElement ? fullscreen : null) ??
    document.body;

  return createPortal(
    <div
      ref={refs.setFloating}
      id={id}
      role="tooltip"
      className={styles.tooltip}
      style={{
        ...floatingStyles,
        visibility: isPositioned ? undefined : 'hidden'
      }}
    >
      {text}
    </div>,
    portalRoot
  );
};

export default CompactTooltip;
