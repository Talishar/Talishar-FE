import React, { ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../CountersOverlay.module.css';

interface TooltipWrapperProps {
  children: ReactNode;
  tooltip: string;
  className?: string;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ children, tooltip, className }) => {
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [adjustedLeft, setAdjustedLeft] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const initialLeft = rect.left + rect.width / 2;
      
      setTooltipPos({
        top: rect.top - (rect.height * 1.1) - 10,
        left: initialLeft,
      });
      
      // Schedule adjustment after render
      setTimeout(() => {
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const tooltipWidth = tooltipRect.width;
          const padding = 10;
          
          let adjustedPosition = initialLeft;
          
          // If tooltip goes off left edge
          if (initialLeft - tooltipWidth / 2 < padding) {
            adjustedPosition = tooltipWidth / 2 + padding;
          }
          // If tooltip goes off right edge
          else if (initialLeft + tooltipWidth / 2 > window.innerWidth - padding) {
            adjustedPosition = window.innerWidth - tooltipWidth / 2 - padding;
          }
          
          setAdjustedLeft(adjustedPosition);
        }
      }, 0);
    }
  };

  const handleMouseLeave = () => {
    setTooltipPos(null);
  };

  return (
    <>
      <div
        ref={elementRef}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {tooltipPos &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: adjustedLeft || tooltipPos.left,
              transform: 'translateX(-50%)',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          >
            <div className={styles.tooltipBox}>{tooltip}</div>
            <div className={styles.tooltipArrow}></div>
          </div>,
          document.body
        )}
    </>
  );
};
