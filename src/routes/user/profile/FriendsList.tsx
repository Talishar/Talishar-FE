import React, { useState } from 'react';
import { useAddFriendMutation, useGetFriendsListQuery, useRemoveFriendMutation, useSearchUsersQuery, useGetPendingRequestsQuery, useAcceptRequestMutation, useRejectRequestMutation, useGetSentRequestsQuery, useCancelRequestMutation, useUpdateFriendNicknameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdPersonAdd, MdCheckCircle, MdCancel, MdBlock, MdEdit } from 'react-icons/md';
import { IoMdArrowDropright } from 'react-icons/io';
import styles from './FriendsList.module.css';
import { Friend } from 'interface/API/FriendListAPI.php';
import { createPatreonIconMap } from 'utils/patronIcons';

interface FriendsListProps {
  className?: string;
}

interface NicknameEditState {
  friendUserId: number | null;
  nickname: string;
}

export const FriendsList: React.FC<FriendsListProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [nicknameEdit, setNicknameEdit] = useState<NicknameEditState>({ friendUserId: null, nickname: '' });

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
  const [updateFriendNickname] = useUpdateFriendNicknameMutation();

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

  const handleEditNickname = (friend: Friend) => {
    setNicknameEdit({ friendUserId: friend.friendUserId, nickname: friend.nickname || '' });
  };

  const handleSaveNickname = async () => {
    if (nicknameEdit.friendUserId === null) return;

    try {
      await updateFriendNickname({ 
        friendUserId: nicknameEdit.friendUserId, 
        nickname: nicknameEdit.nickname 
      }).unwrap();
      toast.success('Nickname updated successfully');
      setNicknameEdit({ friendUserId: null, nickname: '' });
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || 'Failed to update nickname');
    }
  };

  const handleCancelNicknameEdit = () => {
    setNicknameEdit({ friendUserId: null, nickname: '' });
  };

  return (
    <article className={`${styles.friendsListContainer} ${className}`}>
      <h3 
        className={styles.title}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
      >
        Friends List
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
                <th scope="col" className={styles.actionColumnHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sentData.sentRequests.map((request: any) => (
                <tr key={request.friendshipId}>
                  <td>
                    <div className={styles.friendNameContainer}>
                      <div className={styles.friendIcons}>
                        {createPatreonIconMap(
                          request.isContributor,
                          request.isPvtVoidPatron,
                          request.isPatron,
                          false
                        )
                          .filter(icon => icon.condition)
                          .map(icon => (
                            <a
                              key={icon.src}
                              href={icon.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={icon.title}
                              className={styles.friendIcon}
                            >
                              <img src={icon.src} alt={icon.title} />
                            </a>
                          ))}
                      </div>
                      <span>{request.recipientUsername}</span>
                    </div>
                  </td>
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
                <th scope="col" className={styles.actionColumnHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingData.requests.map((request: any) => (
                <tr key={request.friendshipId}>
                  <td>
                    <div className={styles.friendNameContainer}>
                      <div className={styles.friendIcons}>
                        {createPatreonIconMap(
                          request.isContributor,
                          request.isPvtVoidPatron,
                          request.isPatron,
                          false
                        )
                          .filter(icon => icon.condition)
                          .map(icon => (
                            <a
                              key={icon.src}
                              href={icon.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={icon.title}
                              className={styles.friendIcon}
                            >
                              <img src={icon.src} alt={icon.title} />
                            </a>
                          ))}
                      </div>
                      <span>{request.requesterUsername}</span>
                    </div>
                  </td>
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
          <>
            <table className={styles.friendsTable}>
              <thead>
                <tr>
                  <th scope="col">Friend</th>
                  <th scope="col" className={styles.actionColumnHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {friendsData.friends.map((friend) => (
                  <tr key={friend.friendUserId}>
                    <td>
                      <div className={styles.friendNameContainer}>
                        <div className={styles.friendIcons}>
                          {createPatreonIconMap(
                            friend.isContributor,
                            friend.isPvtVoidPatron,
                            friend.isPatron,
                            false
                          )
                            .filter(icon => icon.condition)
                            .map(icon => (
                              <a
                                key={icon.src}
                                href={icon.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={icon.title}
                                className={styles.friendIcon}
                              >
                                <img src={icon.src} alt={icon.title} />
                              </a>
                            ))}
                        </div>
                        <span className={styles.username}>{friend.username}</span>
                        {friend.nickname && (
                          <span className={styles.nickname}>({friend.nickname})</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.deleteColumn}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditNickname(friend)}
                        title="Edit nickname"
                      >
                        <MdEdit fontSize="1.5em" />
                      </button>
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
          </>
        ) : (
          <p></p>
        )}
      </div>

      {/* Nickname Edit Modal */}
      {nicknameEdit.friendUserId !== null && (
        <div className={styles.modalOverlay} onClick={handleCancelNicknameEdit}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Nickname</h3>
            <input
              type="text"
              placeholder="Enter nickname (optional)"
              value={nicknameEdit.nickname}
              onChange={(e) => setNicknameEdit({ ...nicknameEdit, nickname: e.target.value })}
              maxLength={50}
              className={styles.nicknameInput}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.saveButton}
                onClick={handleSaveNickname}
              >
                Save
              </button>
              <button 
                className={styles.cancelButton}
                onClick={handleCancelNicknameEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </article>
  );
};

export default FriendsList;
