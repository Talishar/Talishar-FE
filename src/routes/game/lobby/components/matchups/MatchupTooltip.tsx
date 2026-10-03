import React, { useRef, useEffect, useState } from 'react';
import styles from './MatchupTooltip.module.css';

export interface MatchupTooltipProps {
  content: string | null | undefined;
  children: React.ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const MatchupTooltip: React.FC<MatchupTooltipProps> = ({
  content,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    position: 'top'
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openedByTouchRef = useRef(false);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    // Get trigger position relative to viewport
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8; // Minimum gap from screen edges
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    let position: 'top' | 'bottom' | 'left' | 'right' = 'left';
    let top = 0;
    let left = 0;

    // Default: position to the left
    left = triggerRect.left - tooltipWidth - padding;
    top = triggerRect.top; // Align top with button top

    // Check if tooltip would go off-screen on the left
    if (left < padding) {
      // Position to the right instead
      position = 'right';
      left = triggerRect.right + padding;
      top = triggerRect.top; // Align top with button top

      // If still off-screen on the right, fall back to top
      if (left + tooltipWidth + padding > viewportWidth) {
        position = 'top';
        top = triggerRect.top - tooltipHeight - padding;
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;

        // Adjust if off-screen horizontally
        if (left < padding) left = padding;
        if (left + tooltipWidth + padding > viewportWidth) {
          left = viewportWidth - tooltipWidth - padding;
        }

        // If still off-screen on top, position below
        if (top < padding) {
          position = 'bottom';
          top = triggerRect.bottom + padding;
        }
      }
    }

    left = Math.max(
      padding,
      Math.min(left, viewportWidth - tooltipWidth - padding)
    );
    top = Math.max(
      padding,
      Math.min(top, viewportHeight - tooltipHeight - padding)
    );

    setTooltipPos({ top, left, position });
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setIsVisible(false);
    };
    const handleScroll = () => {
      if (openedByTouchRef.current) setIsVisible(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible]);

  if (!content) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={triggerRef}
      className={styles.tooltipContainer}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        openedByTouchRef.current = false;
        setIsVisible(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setIsVisible(false);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'mouse') return;
        if (tooltipRef.current?.contains(e.target as Node)) return;
        openedByTouchRef.current = true;
        setIsVisible(true);
      }}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onClick={(e) => {
            e.stopPropagation();
            if ((e.target as Element).closest('a')) return;
            setIsVisible(false);
          }}
          className={`${styles.tooltip} ${styles[tooltipPos.position]}`}
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
};

export default MatchupTooltip;
