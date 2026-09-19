import type { CSSProperties } from 'react';

export const TOAST_STYLE: CSSProperties = {
  background: 'var(--theme-tertiary)',
  color: 'var(--white)',
  border: '1px solid var(--theme-border)',
  padding: '0.5rem',
  wordBreak: 'break-word',
  maxWidth: '100vw',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  msUserSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  zIndex: 10001
};

export const TOAST_OPTIONS = { style: TOAST_STYLE };
