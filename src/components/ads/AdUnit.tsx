import React from 'react';
import './AdUnit.css';

interface AdUnitProps {
  placement: string;
  className?: string;
}

/**
 * AdUnit Component
 * Renders a RevContent ad placement
 * 
 * Available placements:
 * - left-rail-1 (300x250)
 * - left-rail-2 (300x600)
 * - right-rail-1 (300x250)
 * - right-rail-2 (300x600)
 * - billboard-1, billboard-2, etc. (970x250)
 * - leaderboard-1, leaderboard-2, etc. (728x90)
 * - mobile-unit-1, mobile-unit-2, etc. (300x250)
 */
export const AdUnit: React.FC<AdUnitProps> = ({ placement, className = '' }) => {
  return (
    <div 
      className={`ad-unit ${className}`}
      data-ad={placement}
    />
  );
};

export default AdUnit;
