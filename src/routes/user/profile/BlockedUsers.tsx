import React, { useState } from 'react';
import {
  useBlockUserMutation,
  useGetBlockedUsersQuery,
  useUnblockUserMutation
} from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdPersonAdd } from 'react-icons/md';
import { IoMdArrowDropright } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import styles from './BlockedUsers.module.css';
import { BlockedUser } from 'interface/API/BlockedUsersAPI.php';
import { useUserSearch } from 'hooks/useUserSearch';
import { UserSearchResults } from './UserSearchResults';

interface BlockedUsersProps {
  className?: string;
}

export const BlockedUsers: React.FC<BlockedUsersProps> = ({ className }) => {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    showSearchResults,
    users: searchResults,
    isLoading: searchLoading,
    resetSearch
  } = useUserSearch();
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    data: blockedUsersData,
    isLoading: blockedUsersLoading,
    refetch: refetchBlockedUsers
  } = useGetBlockedUsersQuery(undefined);

  const [blockUser, { isLoading: isBlockingUser }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblockingUser }] =
    useUnblockUserMutation();

  // Get set of blocked user IDs
  const blockedUserIds = new Set(
    blockedUsersData?.blockedUsers?.map((user: any) => user.blockedUserId) || []
  );

  const handleBlockUser = async (blockedUsername: string) => {
    try {
      await blockUser({ blockedUsername }).unwrap();
      toast.success(t('PROFILE.USER_BLOCKED', { username: blockedUsername }));
      resetSearch();
      refetchBlockedUsers();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_BLOCK'));
    }
  };

  const handleUnblockUser = async (blockedUser: BlockedUser) => {
    if (
      !window.confirm(
        t('PROFILE.UNBLOCK_CONFIRM', { username: blockedUser.username })
      )
    ) {
      return;
    }

    try {
      await unblockUser({ blockedUserId: blockedUser.blockedUserId }).unwrap();
      toast.success(
        t('PROFILE.USER_UNBLOCKED', { username: blockedUser.username })
      );
      refetchBlockedUsers();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_UNBLOCK'));
    }
  };

  return (
    <article className={`${styles.blockedUsersContainer} ${className}`}>
      <h3 className={styles.title}>
        <button
          type="button"
          className={styles.titleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {t('PROFILE.BLOCKED_USERS')}
          <span
            style={{
              marginLeft: '8px',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-hidden="true"
          >
            <IoMdArrowDropright />
          </span>
        </button>
      </h3>

      {isExpanded && (
        <>
          {/* Block User Section */}
          <div className={styles.blockUserSection}>
            <div className={styles.searchContainer}>
              <input
                id="block-user-search"
                name="block-user-search"
                type="text"
                placeholder={t('PROFILE.SEARCH_BLOCK_PLACEHOLDER')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <UserSearchResults
              users={searchResults}
              isVisible={showSearchResults}
              isLoading={searchLoading}
              isMutating={isBlockingUser}
              unavailableUserIds={blockedUserIds}
              loadingText={t('PROFILE.SEARCHING')}
              noResultsText={t('PROFILE.NO_USERS_FOUND')}
              actionLabel={t('PROFILE.BLOCK_USER')}
              unavailableActionLabel={t('PROFILE.USER_ALREADY_BLOCKED')}
              actionIcon={<MdPersonAdd />}
              unavailableActionIcon={t('PROFILE.BLOCKED')}
              onSelect={(user) => handleBlockUser(user.username)}
              styles={styles}
              actionClassName={styles.blockButton}
              disabledActionClassName={styles.blockButtonDisabled}
            />
          </div>

          {/* Blocked Users List */}
          <div className={styles.blockedUsersTableContainer}>
            {blockedUsersLoading ? (
              <p className={styles.loadingText}>
                {t('PROFILE.LOADING_BLOCKED_USERS')}
              </p>
            ) : blockedUsersData?.blockedUsers &&
              blockedUsersData.blockedUsers.length > 0 ? (
              <table className={styles.blockedUsersTable}>
                <thead>
                  <tr>
                    <th scope="col">{t('PROFILE.BLOCKED_USER')}</th>
                    <th scope="col">{t('PROFILE.ACTION')}</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedUsersData.blockedUsers.map(
                    (blockedUser: BlockedUser) => (
                      <tr key={blockedUser.blockedUserId}>
                        <td>{blockedUser.username}</td>
                        <td className={styles.deleteColumn}>
                          <button
                            className={styles.unblockButton}
                            onClick={() => handleUnblockUser(blockedUser)}
                            title={t('PROFILE.UNBLOCK_USER')}
                            aria-label={t('PROFILE.UNBLOCK_USER')}
                            disabled={isUnblockingUser}
                          >
                            <RiDeleteBin5Line fontSize="1.5em" />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p></p>
            )}
          </div>
        </>
      )}
    </article>
  );
};

export default BlockedUsers;
