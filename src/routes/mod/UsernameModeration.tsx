import React, { useState } from 'react';
import { useGetOffensiveUsernamesQuery, useBanOffensiveUsernameMutation, useWhitelistOffensiveUsernameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import styles from './UsernameModeration.module.css';

interface OffensiveUser {
  usersId: number;
  username: string;
  matchedPattern: string;
}

export const UsernameModeration: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [expandedUserIds, setExpandedUserIds] = useState<Set<number>>(new Set());

  const { data: moderationData, isLoading, refetch } = useGetOffensiveUsernamesQuery();
  const [banUsername, { isLoading: isBanning }] = useBanOffensiveUsernameMutation();
  const [whitelistUsername, { isLoading: isWhitelisting }] = useWhitelistOffensiveUsernameMutation();

  const handleSelectUser = (usersId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(usersId)) {
      newSelected.delete(usersId);
    } else {
      newSelected.add(usersId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (moderationData?.offensiveUsers) {
      if (selectedUsers.size === moderationData.offensiveUsers.length) {
        setSelectedUsers(new Set());
      } else {
        setSelectedUsers(
          new Set(moderationData.offensiveUsers.map((user) => user.usersId))
        );
      }
    }
  };

  const handleBanSelected = async () => {
    if (selectedUsers.size === 0) {
      toast.error('No users selected');
      return;
    }

    const usersToBan = moderationData?.offensiveUsers.filter((user) =>
      selectedUsers.has(user.usersId)
    ) || [];

    if (
      !window.confirm(
        `Ban ${usersToBan.length} user(s) with offensive usernames?\n\n${usersToBan
          .map((u) => u.username)
          .join(', ')}`
      )
    ) {
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const user of usersToBan) {
      try {
        await banUsername({ username: user.username }).unwrap();
        successCount++;
      } catch (err: any) {
        console.error(`Failed to ban ${user.username}:`, err);
        failureCount++;
      }
    }

    toast.success(
      `Banned ${successCount} user(s)${failureCount > 0 ? ` (${failureCount} failed)` : ''}`
    );
    setSelectedUsers(new Set());
    await refetch();
  };

  const toggleExpandedUser = (usersId: number) => {
    const newExpanded = new Set(expandedUserIds);
    if (newExpanded.has(usersId)) {
      newExpanded.delete(usersId);
    } else {
      newExpanded.add(usersId);
    }
    setExpandedUserIds(newExpanded);
  };

  const handleWhitelistUser = async (user: OffensiveUser) => {
    if (
      !window.confirm(
        `Whitelist "${user.username}"?\n\nThis username matched pattern "${user.matchedPattern}" but will be excluded from future moderation scans.`
      )
    ) {
      return;
    }

    try {
      await whitelistUsername({ username: user.username }).unwrap();
      toast.success(`Whitelisted ${user.username}`);
      await refetch();
    } catch (err: any) {
      console.error(`Failed to whitelist ${user.username}:`, err);
      toast.error(`Failed to whitelist ${user.username}`);
    }
  };

  const offensiveUsers = moderationData?.offensiveUsers || [];

  return (
    <div className={styles.container}>
      <h2>Username Moderation</h2>

      {isLoading ? (
        <p>Scanning database for offensive usernames...</p>
      ) : offensiveUsers.length > 0 ? (
        <div>
          <div className={styles.summary}>
            <p>
              Found <strong>{offensiveUsers.length}</strong> user(s) with potentially offensive
              usernames
            </p>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.selectAllButton}
              onClick={handleSelectAll}
              disabled={isBanning || isWhitelisting}
            >
              {selectedUsers.size === offensiveUsers.length && offensiveUsers.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>

            <button
              className={styles.banButton}
              onClick={handleBanSelected}
              disabled={selectedUsers.size === 0 || isBanning || isWhitelisting}
            >
              {isBanning ? 'Banning...' : `Ban Selected (${selectedUsers.size})`}
            </button>

            <button className={styles.refreshButton} onClick={() => refetch()} disabled={isBanning || isWhitelisting}>
              Refresh
            </button>
          </div>

          <div className={styles.usersList}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={
                        offensiveUsers.length > 0 &&
                        selectedUsers.size === offensiveUsers.length
                      }
                      onChange={handleSelectAll}
                      disabled={isBanning || isWhitelisting}
                    />
                  </th>
                  <th>Username</th>
                  <th>Matched Pattern</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offensiveUsers.map((user) => (
                  <tr key={user.usersId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.usersId)}
                        onChange={() => handleSelectUser(user.usersId)}
                        disabled={isBanning || isWhitelisting}
                      />
                    </td>
                    <td
                      className={styles.usernameCell}
                      onClick={() => toggleExpandedUser(user.usersId)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.username}
                      {expandedUserIds.has(user.usersId) && (
                        <div className={styles.details}>
                          <small>User ID: {user.usersId}</small>
                        </div>
                      )}
                    </td>
                    <td className={styles.patternCell}>
                      <span className={styles.pattern}>{user.matchedPattern}</span>
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.banSingleButton}
                        onClick={() => {
                          handleSelectUser(user.usersId);
                          setTimeout(() => {
                            setSelectedUsers(new Set([user.usersId]));
                            handleBanSelected();
                          }, 0);
                        }}
                        disabled={isBanning || isWhitelisting || selectedUsers.size > 0}
                        title="Ban this user immediately"
                      >
                        Ban
                      </button>
                      <button
                        className={styles.whitelistButton}
                        onClick={() => handleWhitelistUser(user)}
                        disabled={isBanning || isWhitelisting}
                        title="Whitelist this username"
                      >
                        {isWhitelisting ? 'Whitelisting...' : 'Whitelist'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className={styles.noResults}>No offensive usernames detected!</p>
      )}
    </div>
  );
};

export default UsernameModeration;
