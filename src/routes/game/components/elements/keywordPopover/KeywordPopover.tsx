import React, { useRef, useState } from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole
} from '@floating-ui/react';
import { getKeywordEntry } from 'data/keywords';
import KeywordDefinitionBody from './KeywordDefinitionBody';
import styles from './KeywordPopover.module.css';

export default function KeywordPopover({ id, children, className }: { id: string; children: React.ReactElement; className?: string }) {
  const entry = getKeywordEntry(id);
  const [open, setOpen] = useState(false);
  const hoverEnabled = useRef(typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches);
  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen, placement: 'top', middleware: [offset(8), flip(), shift({ padding: 8 })], whileElementsMounted: autoUpdate });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { enabled: hoverEnabled.current, delay: { open: 300, close: 120 }, handleClose: safePolygon() }),
    useFocus(context), useClick(context), useDismiss(context), useRole(context, { role: 'dialog' })
  ]);
  if (!entry) return children;
  return <>
    {React.cloneElement(children, { ref: refs.setReference, className: [children.props.className, styles.trigger, className].filter(Boolean).join(' '), ...getReferenceProps({ onClick: (event: React.MouseEvent) => event.stopPropagation(), onTouchStart: (event: React.TouchEvent) => event.stopPropagation() }) })}
    {open && <FloatingPortal><div ref={refs.setFloating} className={styles.popover} style={floatingStyles} {...getFloatingProps()}><KeywordDefinitionBody entry={entry} /></div></FloatingPortal>}
  </>;
}
