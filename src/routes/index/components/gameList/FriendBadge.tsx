import React from 'react';
import { MdPeople } from 'react-icons/md';
import styles from './FriendBadge.module.css';

interface FriendBadgeProps {
  isFriendsGame?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const FriendBadge: React.FC<FriendBadgeProps> = ({ 
  isFriendsGame = false, 
  size = 'small',
  label = '👥'
}) => {
  if (!isFriendsGame) {
    return null;
  }

  return (
    <div className={`${styles.friendBadge} ${styles[size]}`} title="Friend's game">
      {label}
    </div>
  );
};

export default FriendBadge;
