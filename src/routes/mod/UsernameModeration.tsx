import React, { useState } from 'react';
import {
  useGetOffensiveUsernamesQuery,
  useBanOffensiveUsernameMutation,
  useWhitelistOffensiveUsernameMutation
} from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { useTranslation, Trans } from 'react-i18next';
import styles from './UsernameModeration.module.css';

interface OffensiveUser {
  usersId: number;
  username: string;
  matchedPattern: string;
}

export const UsernameModeration: React.FC = () => {
  const { t } = useTranslation();
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [expandedUserIds, setExpandedUserIds] = useState<Set<number>>(
    new Set()
  );
  const [scanEnabled, setScanEnabled] = useState(false);

  const {
    data: moderationData,
    isLoading,
    refetch
  } = useGetOffensiveUsernamesQuery(undefined, { skip: !scanEnabled });
  const [banUsername, { isLoading: isBanning }] =
    useBanOffensiveUsernameMutation();
  const [whitelistUsername, { isLoading: isWhitelisting }] =
    useWhitelistOffensiveUsernameMutation();

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
          new Set(
            moderationData.offensiveUsers.map(
              (user: OffensiveUser) => user.usersId
            )
          )
        );
      }
    }
  };

  const handleBanSelected = async () => {
    if (selectedUsers.size === 0) {
      toast.error(t('USERNAME_MODERATION.NO_USERS_SELECTED'));
      return;
    }

    const usersToBan =
      moderationData?.offensiveUsers.filter((user: OffensiveUser) =>
        selectedUsers.has(user.usersId)
      ) || [];

    if (
      !window.confirm(
        t('USERNAME_MODERATION.BAN_CONFIRM', {
          count: usersToBan.length,
          usernames: usersToBan.map((u: OffensiveUser) => u.username).join(', ')
        })
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
      `${t('USERNAME_MODERATION.BANNED_SUCCESS', { count: successCount })}${
        failureCount > 0
          ? t('USERNAME_MODERATION.FAILED_SUFFIX', { count: failureCount })
          : ''
      }`
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
        t('USERNAME_MODERATION.WHITELIST_CONFIRM', {
          username: user.username,
          pattern: user.matchedPattern
        })
      )
    ) {
      return;
    }

    try {
      await whitelistUsername({ username: user.username }).unwrap();
      toast.success(
        t('USERNAME_MODERATION.WHITELISTED_ONE', { username: user.username })
      );
      await refetch();
    } catch (err: any) {
      console.error(`Failed to whitelist ${user.username}:`, err);
      toast.error(
        t('USERNAME_MODERATION.WHITELIST_FAILED', { username: user.username })
      );
    }
  };

  const handleWhitelistSelected = async () => {
    if (selectedUsers.size === 0) {
      toast.error(t('USERNAME_MODERATION.NO_USERS_SELECTED'));
      return;
    }

    const usersToWhitelist =
      moderationData?.offensiveUsers.filter((user: OffensiveUser) =>
        selectedUsers.has(user.usersId)
      ) || [];

    if (
      !window.confirm(
        t('USERNAME_MODERATION.WHITELIST_BATCH_CONFIRM', {
          count: usersToWhitelist.length,
          usernames: usersToWhitelist
            .map((u: OffensiveUser) => u.username)
            .join(', ')
        })
      )
    ) {
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const user of usersToWhitelist) {
      try {
        await whitelistUsername({ username: user.username }).unwrap();
        successCount++;
      } catch (err: any) {
        console.error(`Failed to whitelist ${user.username}:`, err);
        failureCount++;
      }
    }

    toast.success(
      `${t('USERNAME_MODERATION.WHITELISTED_SUCCESS', {
        count: successCount
      })}${
        failureCount > 0
          ? t('USERNAME_MODERATION.FAILED_SUFFIX', { count: failureCount })
          : ''
      }`
    );
    setSelectedUsers(new Set());
    await refetch();
  };

  const offensiveUsers = moderationData?.offensiveUsers || [];

  return (
    <div className={styles.container}>
      <h2>{t('USERNAME_MODERATION.TITLE')}</h2>

      {!scanEnabled ? (
        <button
          className={styles.refreshButton}
          onClick={() => setScanEnabled(true)}
        >
          {t('USERNAME_MODERATION.RUN_SCAN')}
        </button>
      ) : isLoading ? (
        <p>{t('USERNAME_MODERATION.SCANNING')}</p>
      ) : offensiveUsers.length > 0 ? (
        <div>
          <div className={styles.summary}>
            <p>
              <Trans
                i18nKey="USERNAME_MODERATION.FOUND_SUMMARY"
                values={{ count: offensiveUsers.length }}
              >
                Found <strong>{offensiveUsers.length}</strong> user(s) with
                potentially offensive usernames
              </Trans>
            </p>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.selectAllButton}
              onClick={handleSelectAll}
              disabled={isBanning || isWhitelisting}
            >
              {selectedUsers.size === offensiveUsers.length &&
              offensiveUsers.length > 0
                ? t('USERNAME_MODERATION.DESELECT_ALL')
                : t('USERNAME_MODERATION.SELECT_ALL')}
            </button>

            <button
              className={styles.banButton}
              onClick={handleBanSelected}
              disabled={selectedUsers.size === 0 || isBanning || isWhitelisting}
            >
              {isBanning
                ? t('USERNAME_MODERATION.BANNING')
                : t('USERNAME_MODERATION.BAN_SELECTED', {
                    count: selectedUsers.size
                  })}
            </button>

            <button
              className={styles.whitelistSelectedButton}
              onClick={handleWhitelistSelected}
              disabled={selectedUsers.size === 0 || isBanning || isWhitelisting}
            >
              {isWhitelisting
                ? t('USERNAME_MODERATION.WHITELISTING')
                : t('USERNAME_MODERATION.WHITELIST_SELECTED', {
                    count: selectedUsers.size
                  })}
            </button>

            <button
              className={styles.refreshButton}
              onClick={() => refetch()}
              disabled={isBanning || isWhitelisting}
            >
              {t('GAME_LIST.REFRESH')}
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
                  <th>{t('PROFILE.USERNAME_LABEL')}</th>
                  <th>{t('USERNAME_MODERATION.MATCHED_PATTERN')}</th>
                  <th style={{ width: '180px' }}>
                    {t('USERNAME_MODERATION.ACTIONS')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {offensiveUsers.map((user: OffensiveUser) => (
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
                          <small>
                            {t('USERNAME_MODERATION.USER_ID', {
                              id: user.usersId
                            })}
                          </small>
                        </div>
                      )}
                    </td>
                    <td className={styles.patternCell}>
                      <span className={styles.pattern}>
                        {user.matchedPattern}
                      </span>
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
                        disabled={
                          isBanning || isWhitelisting || selectedUsers.size > 0
                        }
                        title={t('USERNAME_MODERATION.BAN_USER_TITLE')}
                      >
                        {t('USERNAME_MODERATION.BAN')}
                      </button>
                      <button
                        className={styles.whitelistButton}
                        onClick={() => handleWhitelistUser(user)}
                        disabled={isBanning || isWhitelisting}
                        title={t('USERNAME_MODERATION.WHITELIST_USER_TITLE')}
                      >
                        {isWhitelisting
                          ? t('USERNAME_MODERATION.WHITELISTING')
                          : t('USERNAME_MODERATION.WHITELIST')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className={styles.noResults}>
          {t('USERNAME_MODERATION.NO_OFFENSIVE_USERS')}
        </p>
      )}
    </div>
  );
};

export default UsernameModeration;
