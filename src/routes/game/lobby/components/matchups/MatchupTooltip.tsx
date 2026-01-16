import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
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

/**
 * Smart tooltip component that displays HTML content safely.
 * Automatically positions to avoid going off-screen (especially important for right-side panels).
 * Uses fixed positioning to avoid being clipped by parent overflow.
 */
const MatchupTooltip: React.FC<MatchupTooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    position: 'top'
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    // Get trigger position relative to viewport
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 0; // No gap between button and tooltip
    const tooltipWidth = tooltipRect.width + 10; // Use actual rendered width
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

    // Clamp vertical position to viewport
    if (top < padding) {
      top = padding;
    } else if (top + tooltipHeight + padding > viewportHeight) {
      top = viewportHeight - tooltipHeight - padding;
    }

    setTooltipPos({ top, left, position });
  }, [isVisible]);

  if (!content) {
    return <div>{children}</div>;
  }

  // Sanitize HTML content
  const sanitizedHTML = DOMPurify.sanitize(content);

  return (
    <div
      ref={triggerRef}
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[tooltipPos.position]}`}
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      )}
    </div>
  );
};

export default MatchupTooltip;
