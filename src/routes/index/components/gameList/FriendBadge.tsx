import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdPeople } from 'react-icons/md';
import styles from './FriendBadge.module.css';

interface FriendBadgeProps {
  isFriendsGame?: boolean;
  friendName?: string;
  tooltip?: string;
  size?: 'tab' | 'small' | 'medium' | 'large';
  label?: string;
}

export const FriendBadge: React.FC<FriendBadgeProps> = ({
  isFriendsGame = false,
  friendName,
  tooltip,
  size = 'small',
  label
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

  const tooltipText = tooltip ?? (friendName ? `${friendName}'s game` : "Friend's game");

  return (
    <>
      <div
        ref={badgeRef}
        className={`${styles.friendBadge} ${styles[size]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label ?? <MdPeople />}
      </div>
      {showTooltip && createPortal(
        <div
          className={styles.tooltip}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          {tooltipText}
        </div>,
        document.body
      )}
    </>
  );
};

export default FriendBadge;
