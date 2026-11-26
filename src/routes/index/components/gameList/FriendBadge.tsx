import React from 'react';
import { MdPeople } from 'react-icons/md';
import styles from './FriendBadge.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  if (!isFriendsGame) {
    return null;
  }

  const tooltipText =
    tooltip ??
    (friendName
      ? t('GAME_LIST.FRIEND_NAMED_GAME', { name: friendName })
      : t('GAME_LIST.FRIEND_GAME'));

  return (
    <div
      className={`${styles.friendBadge} ${styles[size]}`}
      data-compact-tooltip={tooltipText}
    >
      {label ?? <MdPeople />}
    </div>
  );
};

export default FriendBadge;
