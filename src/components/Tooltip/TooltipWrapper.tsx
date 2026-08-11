import React, { ReactNode, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

interface TooltipWrapperProps {
  children: ReactNode;
  tooltip: string;
  className?: string;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  tooltip,
  className
}) => {
  const tooltipId = useId();
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [adjustedLeft, setAdjustedLeft] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const initialLeft = rect.left + rect.width / 2;

    setTooltipPos({
      top: rect.top - rect.height * 1.1 - 10,
      left: initialLeft
    });

    setTimeout(() => {
      if (!tooltipRef.current) return;

      const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
      const padding = 10;
      let adjustedPosition = initialLeft;

      if (initialLeft - tooltipWidth / 2 < padding) {
        adjustedPosition = tooltipWidth / 2 + padding;
      } else if (initialLeft + tooltipWidth / 2 > window.innerWidth - padding) {
        adjustedPosition = window.innerWidth - tooltipWidth / 2 - padding;
      }

      setAdjustedLeft(adjustedPosition);
    }, 0);
  };

  const hideTooltip = () => {
    setTooltipPos(null);
    setAdjustedLeft(0);
  };

  return (
    <>
      <div
        ref={elementRef}
        className={className}
        aria-describedby={tooltipPos ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {tooltipPos &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={styles.portal}
            style={{
              top: tooltipPos.top,
              left: adjustedLeft || tooltipPos.left
            }}
          >
            <div className={styles.tooltip}>{tooltip}</div>
            <div className={styles.arrow} />
          </div>,
          document.body
        )}
    </>
  );
};
