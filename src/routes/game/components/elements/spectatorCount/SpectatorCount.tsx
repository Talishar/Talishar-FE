import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './SpectatorCount.module.css';
import { FaEye } from 'react-icons/fa';

const emptyArray: string[] = [];

interface TooltipPortalProps {
  anchorRef: React.RefObject<HTMLElement>;
  names: string[];
}

const TOOLTIP_MARGIN = 8;

function TooltipPortal({ anchorRef, names }: TooltipPortalProps) {
  const [pos, setPos] = useState({ top: 0, left: 0, maxHeight: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX + rect.width / 2,
      maxHeight: Math.max(
        window.innerHeight - rect.bottom - 4 - TOOLTIP_MARGIN,
        0
      )
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip || pos.maxHeight === 0) return;
    const rect = tooltip.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - TOOLTIP_MARGIN);
    const overflowLeft = TOOLTIP_MARGIN - rect.left;
    const shift = overflowRight > 0 ? -overflowRight : Math.max(overflowLeft, 0);
    if (shift !== 0) {
      setPos((prev) => ({ ...prev, left: prev.left + shift }));
    }
  }, [pos.maxHeight, names]);

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        maxHeight: pos.maxHeight || undefined,
        transform: 'translateX(-50%)'
      }}
    >
      {names.map((name, i) => (
        <div key={i}>{name}</div>
      ))}
    </div>,
    document.body
  );
}

export default function SpectatorCount({
  compact = false
}: {
  compact?: boolean;
}) {
  const spectatorCount = useAppSelector(
    (state: RootState) => state.game?.gameDynamicInfo?.spectatorCount ?? 0
  );
  const spectatorNames = useAppSelector(
    (state: RootState) =>
      state.game?.gameDynamicInfo?.spectatorNames ?? emptyArray
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  if (spectatorCount === 0) {
    return null;
  }

  if (compact) {
    return (
      <div
        ref={anchorRef}
        className={styles.spectatorCountCompact}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`${spectatorCount} ${
          spectatorCount === 1 ? 'spectator' : 'spectators'
        } watching`}
      >
        <FaEye aria-hidden="true" />
        <span className={styles.spectatorCountBadge}>{spectatorCount}</span>
        {showTooltip && spectatorNames.length > 0 && (
          <TooltipPortal anchorRef={anchorRef} names={spectatorNames} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.spectatorCountStyle}>
      <div
        ref={anchorRef}
        className={styles.spectatorCountContainer}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <FaEye style={{ verticalAlign: 'middle' }} />{' '}
        {spectatorCount === 1 ? 'Spectator' : 'Spectators'}: {spectatorCount}
        {showTooltip && spectatorNames.length > 0 && (
          <TooltipPortal anchorRef={anchorRef} names={spectatorNames} />
        )}
      </div>
    </div>
  );
}
