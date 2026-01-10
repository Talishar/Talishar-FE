import React, { useState, useRef } from 'react';
import { MdPeople } from 'react-icons/md';
import styles from './FriendBadge.module.css';

interface FriendBadgeProps {
  isFriendsGame?: boolean;
  friendName?: string;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const FriendBadge: React.FC<FriendBadgeProps> = ({ 
  isFriendsGame = false,
  friendName,
  size = 'small',
  label = '👥'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isFriendsGame) {
    return null;
  }

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 5,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const tooltipText = friendName ? `${friendName}'s game` : "Friend's game";

  return (
    <>
      <div 
        ref={badgeRef}
        className={`${styles.friendBadge} ${styles[size]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </div>
      {showTooltip && (
        <div 
          className={styles.tooltip}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          {tooltipText}
        </div>
      )}
    </>
  );
};

export default FriendBadge;
