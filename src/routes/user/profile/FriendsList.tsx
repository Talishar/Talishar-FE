import React, { useState } from 'react';
import { useAddFriendMutation, useGetFriendsListQuery, useRemoveFriendMutation, useSearchUsersQuery, useGetPendingRequestsQuery, useAcceptRequestMutation, useRejectRequestMutation, useGetSentRequestsQuery, useCancelRequestMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdPersonAdd, MdCheckCircle, MdCancel, MdBlock } from 'react-icons/md';
import styles from './FriendsList.module.css';
import { Friend } from 'interface/API/FriendListAPI.php';

interface FriendsListProps {
  className?: string;
}

export const FriendsList: React.FC<FriendsListProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const {
    data: friendsData,
    isLoading: friendsLoading,
    refetch: refetchFriends
  } = useGetFriendsListQuery(undefined);

  const [addFriend] = useAddFriendMutation();
  const [removeFriend] = useRemoveFriendMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [cancelRequest] = useCancelRequestMutation();

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending
  } = useGetPendingRequestsQuery(undefined);

  const {
    data: sentData,
    isLoading: sentLoading,
    refetch: refetchSent
  } = useGetSentRequestsQuery(undefined);

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

  // Get set of user IDs that have pending sent requests
  const sentRequestUserIds = new Set(sentData?.sentRequests?.map((req: any) => req.recipientUserId) || []);

  const handleAddFriend = async (friendUsername: string) => {
    try {
      const result = await addFriend({ friendUsername }).unwrap();
      toast.success(`Friend request sent to ${friendUsername}!`);
      setSearchTerm('');
      setShowSearchResults(false);
      refetchSent();
      refetchPending();
    } catch (err: any) {
      toast.error(err.error || 'Failed to send friend request');
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    if (!window.confirm(`Are you sure you want to remove ${friend.username} from your friends?`)) {
      return;
    }

    try {
      await removeFriend({ friendUserId: friend.friendUserId }).unwrap();
      toast.success(`Removed ${friend.username} from friends`);
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || 'Failed to remove friend');
    }
  };

  const handleAcceptRequest = async (requesterUserId: number, requesterUsername: string) => {
    try {
      await acceptRequest({ requesterUserId }).unwrap();
      toast.success(`Added ${requesterUsername} as a friend!`);
      refetchPending();
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requesterUserId: number, requesterUsername: string) => {
    try {
      await rejectRequest({ requesterUserId }).unwrap();
      toast.success(`Rejected friend request from ${requesterUsername}`);
      refetchPending();
    } catch (err: any) {
      toast.error(err.error || 'Failed to reject friend request');
    }
  };

  const handleCancelRequest = async (recipientUserId: number, recipientUsername: string) => {
    if (!window.confirm(`Cancel friend request sent to ${recipientUsername}?`)) {
      return;
    }

    try {
      await cancelRequest({ recipientUserId }).unwrap();
      toast.success(`Cancelled request sent to ${recipientUsername}`);
      refetchSent();
    } catch (err: any) {
      toast.error(err.error || 'Failed to cancel friend request');
    }
  };

  return (
    <article className={`${styles.friendsListContainer} ${className}`}>
      <h3 className={styles.title}>Friends List</h3>

      {/* Add Friend Section */}
      <div className={styles.addFriendSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for players to add..."
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
                {searchResults.users.map((user) => {
                  const hasRequestSent = sentRequestUserIds.has(user.usersId);
                  return (
                    <li key={user.usersId} className={styles.resultItem}>
                      <span>{user.username}</span>
                      <button
                        className={`${styles.addButton} ${hasRequestSent ? styles.addButtonDisabled : ''}`}
                        onClick={() => !hasRequestSent && handleAddFriend(user.username)}
                        disabled={hasRequestSent}
                        title={hasRequestSent ? 'Friend request already sent' : 'Add friend'}
                      >
                        {hasRequestSent ? <MdBlock /> : <MdPersonAdd />}
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

      {/* Sent Friend Requests Section */}
      {!sentLoading && sentData?.sentRequests && sentData.sentRequests.length > 0 && (
        <div className={styles.friendsTableContainer}>
          <h4 className={styles.subtitle}>Pending Friend Requests Sent</h4>
          <table className={styles.friendsTable}>
            <thead>
              <tr>
                <th scope="col">Sent To</th>
                <th scope="col" style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sentData.sentRequests.map((request: any) => (
                <tr key={request.friendshipId}>
                  <td>{request.recipientUsername}</td>
                  <td className={styles.deleteColumn}>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleCancelRequest(request.recipientUserId, request.recipientUsername)}
                      title="Cancel friend request"
                    >
                      <MdCancel fontSize="1.5em" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Friend Requests Section */}
      {!pendingLoading && pendingData?.requests && pendingData.requests.length > 0 && (
        <div className={styles.friendsTableContainer}>
          <h4 className={styles.subtitle}>Pending Friend Requests</h4>
          <table className={styles.friendsTable}>
            <thead>
              <tr>
                <th scope="col">From</th>
                <th scope="col" style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingData.requests.map((request: any) => (
                <tr key={request.friendshipId}>
                  <td>{request.requesterUsername}</td>
                  <td className={styles.deleteColumn}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleAcceptRequest(request.requesterUserId, request.requesterUsername)}
                      title="Accept friend request"
                    >
                      <MdCheckCircle fontSize="1.5em" />
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleRejectRequest(request.requesterUserId, request.requesterUsername)}
                      title="Reject friend request"
                    >
                      <MdCancel fontSize="1.5em" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Friends List */}
      <div className={styles.friendsTableContainer}>
        {friendsLoading ? (
          <p className={styles.loadingText}>Loading friends...</p>
        ) : friendsData?.friends && friendsData.friends.length > 0 ? (
          <table className={styles.friendsTable}>
            <thead>
              <tr>
                <th scope="col">Friend</th>
                <th scope="col" style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {friendsData.friends.map((friend) => (
                <tr key={friend.friendUserId}>
                  <td>{friend.username}</td>
                  <td className={styles.deleteColumn}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveFriend(friend)}
                      title="Remove friend"
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
    </article>
  );
};

export default FriendsList;
