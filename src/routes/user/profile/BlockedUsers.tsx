import React, { useState } from 'react';
import { useBlockUserMutation, useGetBlockedUsersQuery, useUnblockUserMutation, useSearchUsersQuery } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdPersonAdd } from 'react-icons/md';
import { IoMdArrowDropright } from 'react-icons/io';
import styles from './BlockedUsers.module.css';
import { BlockedUser } from 'interface/API/BlockedUsersAPI.php';

interface BlockedUsersProps {
  className?: string;
}

export const BlockedUsers: React.FC<BlockedUsersProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    data: blockedUsersData,
    isLoading: blockedUsersLoading,
    refetch: refetchBlockedUsers
  } = useGetBlockedUsersQuery(undefined);

  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  // Search users with debouncing
  const shouldSearch = debouncedSearchTerm.length >= 2;
  const {
    data: searchResults,
    isLoading: searchLoading
  } = useSearchUsersQuery(
    { searchTerm: debouncedSearchTerm, limit: 10 },
    { skip: !shouldSearch }
  );

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setShowSearchResults(searchTerm.length >= 2);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get set of blocked user IDs
  const blockedUserIds = new Set(blockedUsersData?.blockedUsers?.map((user: any) => user.blockedUserId) || []);

  const handleBlockUser = async (blockedUsername: string) => {
    try {
      const result = await blockUser({ blockedUsername }).unwrap();
      toast.success(`${blockedUsername} has been blocked`);
      setSearchTerm('');
      setShowSearchResults(false);
      refetchBlockedUsers();
    } catch (err: any) {
      toast.error(err.error || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (blockedUser: BlockedUser) => {
    if (!window.confirm(`Are you sure you want to unblock ${blockedUser.username}?`)) {
      return;
    }

    try {
      await unblockUser({ blockedUserId: blockedUser.blockedUserId }).unwrap();
      toast.success(`${blockedUser.username} has been unblocked`);
      refetchBlockedUsers();
    } catch (err: any) {
      toast.error(err.error || 'Failed to unblock user');
    }
  };

  return (
    <article className={`${styles.blockedUsersContainer} ${className}`}>
      <h3 
        className={styles.title}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
      >
        Blocked Users
        <span style={{ 
          marginLeft: '8px',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', 
          transition: 'transform 0.2s ease',
          display: 'flex',
          alignItems: 'center'
        }}>
          <IoMdArrowDropright />
        </span>
      </h3>

      {isExpanded && (
        <>
          {/* Block User Section */}
          <div className={styles.blockUserSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search for players to block..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className={styles.searchResults}>
                {searchLoading && <p className={styles.loadingText}>Searching...</p>}
                {!searchLoading && searchResults?.users && searchResults.users.length > 0 ? (
                  <ul className={styles.resultsList}>
                    {[...searchResults.users]
                      .sort((a, b) => {
                        const term = searchTerm.toLowerCase();
                        const aExact = a.username.toLowerCase() === term;
                        const bExact = b.username.toLowerCase() === term;

                        if (aExact && !bExact) return -1;
                        if (bExact && !aExact) return 1;
                        return 0;
                      })
                      .map((user) => {
                        const isBlocked = blockedUserIds.has(user.usersId);
                        return (
                          <li key={user.usersId} className={styles.resultItem}>
                            <span>{user.username}</span>
                            <button
                              className={`${styles.blockButton} ${
                                isBlocked ? styles.blockButtonDisabled : ''
                              }`}
                              onClick={() => !isBlocked && handleBlockUser(user.username)}
                              disabled={isBlocked}
                              title={isBlocked ? 'User already blocked' : 'Block user'}
                            >
                              {isBlocked ? '✓ Blocked' : <MdPersonAdd />}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  !searchLoading && <p className={styles.noResults}>No users found</p>
                )}
              </div>
            )}
          </div>

          {/* Blocked Users List */}
          <div className={styles.blockedUsersTableContainer}>
            {blockedUsersLoading ? (
              <p className={styles.loadingText}>Loading blocked users...</p>
            ) : blockedUsersData?.blockedUsers && blockedUsersData.blockedUsers.length > 0 ? (
              <table className={styles.blockedUsersTable}>
                <thead>
                  <tr>
                    <th scope="col">Blocked User</th>
                    <th scope="col" style={{ width: '120px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedUsersData.blockedUsers.map((blockedUser: BlockedUser) => (
                    <tr key={blockedUser.blockedUserId}>
                      <td>{blockedUser.username}</td>
                      <td className={styles.deleteColumn}>
                        <button
                          className={styles.unblockButton}
                          onClick={() => handleUnblockUser(blockedUser)}
                          title="Unblock user"
                        >
                          <RiDeleteBin5Line fontSize="1.5em" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
