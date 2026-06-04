import React, { useState, useRef, useEffect } from 'react';
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

function TooltipPortal({ anchorRef, names }: TooltipPortalProps) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [anchorRef]);

  return ReactDOM.createPortal(
    <div
      className={styles.tooltip}
      style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
    >
      {names.map((name, i) => (
        <div key={i}>{name}</div>
      ))}
    </div>,
    document.body
  );
}

export default function SpectatorCount({ compact = false }: { compact?: boolean }) {
  const spectatorCount = useAppSelector(
    (state: RootState) => state.game?.gameDynamicInfo?.spectatorCount ?? 0
  );
  const spectatorNames = useAppSelector(
    (state: RootState) => state.game?.gameDynamicInfo?.spectatorNames ?? emptyArray
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
        aria-label={`${spectatorCount} ${spectatorCount === 1 ? 'spectator' : 'spectators'} watching`}
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
        <FaEye style={{ verticalAlign: 'middle' }} /> {spectatorCount === 1 ? 'Spectator' : 'Spectators'}:{' '}
        {spectatorCount}
        {showTooltip && spectatorNames.length > 0 && (
          <TooltipPortal anchorRef={anchorRef} names={spectatorNames} />
        )}
      </div>
    </div>
  );
}
