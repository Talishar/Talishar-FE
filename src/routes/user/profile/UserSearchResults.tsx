import React, { ReactNode } from 'react';
import { User } from 'interface/API/FriendListAPI.php';

interface UserSearchResultsProps {
  users: User[];
  isVisible: boolean;
  isLoading: boolean;
  isMutating: boolean;
  unavailableUserIds: Set<number>;
  loadingText: string;
  noResultsText: string;
  actionLabel: string;
  unavailableActionLabel: string;
  actionIcon: ReactNode;
  unavailableActionIcon: ReactNode;
  onSelect: (user: User) => void;
  styles: Record<string, string>;
  actionClassName: string;
  disabledActionClassName: string;
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  isVisible,
  isLoading,
  isMutating,
  unavailableUserIds,
  loadingText,
  noResultsText,
  actionLabel,
  unavailableActionLabel,
  actionIcon,
  unavailableActionIcon,
  onSelect,
  styles,
  actionClassName,
  disabledActionClassName
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.searchResults}>
      {isLoading ? (
        <p className={styles.loadingText}>{loadingText}</p>
      ) : users.length > 0 ? (
        <ul className={styles.resultsList}>
          {users.map((user) => {
            const isUnavailable = unavailableUserIds.has(user.usersId);
            const label = isUnavailable ? unavailableActionLabel : actionLabel;

            return (
              <li key={user.usersId} className={styles.resultItem}>
                <span>{user.username}</span>
                <button
                  className={`${actionClassName} ${
                    isUnavailable ? disabledActionClassName : ''
                  }`}
                  onClick={() => !isUnavailable && onSelect(user)}
                  disabled={isUnavailable || isMutating}
                  aria-label={label}
                  title={label}
                >
                  {isUnavailable ? unavailableActionIcon : actionIcon}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.noResults}>{noResultsText}</p>
      )}
    </div>
  );
};
