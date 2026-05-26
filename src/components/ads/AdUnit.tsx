import React from 'react';
import './AdUnit.css';

interface AdUnitProps {
  placement: string;
  className?: string;
}

/**
 * AdUnit
 *
 * Renders a RevContent ad placement inside a sandboxed iframe. The sandbox
 * omits allow-top-navigation, so even if the ad network serves malvertising,
 * the browser will not let it navigate the main window. Ad clicks still open
 * in a new tab via allow-popups + allow-popups-to-escape-sandbox.
 *
 * Available placements:
 * - left-rail-1 / right-rail-1 (300x250)
 * - left-rail-2 / right-rail-2 (300x600)
 * - billboard-1, billboard-2, ... (970x250)
 * - leaderboard-1, leaderboard-2, ... (728x90)
 * - mobile-unit-1, mobile-unit-2, ... (300x250)
 * - in-game-block, video
 */
export const AdUnit: React.FC<AdUnitProps> = ({
  placement,
  className = ''
}) => {
  return (
    <iframe
      src={`/ad-frame.html?placement=${encodeURIComponent(placement)}`}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
      className={`ad-unit ${className}`}
      data-ad={placement}
      title="Advertisement"
      scrolling="no"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
};

export default AdUnit;
