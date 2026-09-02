import React, { useState } from 'react';
import {
  useAddFriendMutation,
  useGetFriendsListQuery,
  useRemoveFriendMutation,
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useGetSentRequestsQuery,
  useCancelRequestMutation,
  useUpdateFriendNicknameMutation
} from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { RiDeleteBin5Line } from 'react-icons/ri';
import {
  MdPersonAdd,
  MdCheckCircle,
  MdCancel,
  MdBlock,
  MdEdit
} from 'react-icons/md';
import { IoMdArrowDropright } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import styles from './FriendsList.module.css';
import { Friend } from 'interface/API/FriendListAPI.php';
import { createPatreonIconMap } from 'utils/patronIcons';
import { useUserSearch } from 'hooks/useUserSearch';
import { UserSearchResults } from './UserSearchResults';

interface FriendsListProps {
  className?: string;
}

interface NicknameEditState {
  friendUserId: number | null;
  nickname: string;
}

export const FriendsList: React.FC<FriendsListProps> = ({ className }) => {
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
  const [nicknameEdit, setNicknameEdit] = useState<NicknameEditState>({
    friendUserId: null,
    nickname: ''
  });

  const {
    data: friendsData,
    isLoading: friendsLoading,
    refetch: refetchFriends
  } = useGetFriendsListQuery(undefined);

  const [addFriend, { isLoading: isAddingFriend }] = useAddFriendMutation();
  const [removeFriend, { isLoading: isRemovingFriend }] =
    useRemoveFriendMutation();
  const [acceptRequest, { isLoading: isAcceptingRequest }] =
    useAcceptRequestMutation();
  const [rejectRequest, { isLoading: isRejectingRequest }] =
    useRejectRequestMutation();
  const [cancelRequest, { isLoading: isCancellingRequest }] =
    useCancelRequestMutation();
  const [updateFriendNickname, { isLoading: isUpdatingNickname }] =
    useUpdateFriendNicknameMutation();

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

  // Get set of user IDs that have pending sent requests
  const sentRequestUserIds = new Set(
    sentData?.sentRequests?.map((req: any) => req.recipientUserId) || []
  );

  const handleAddFriend = async (friendUsername: string) => {
    try {
      await addFriend({ friendUsername }).unwrap();
      toast.success(
        t('PROFILE.FRIEND_REQUEST_SENT', { username: friendUsername })
      );
      resetSearch();
      refetchSent();
      refetchPending();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_SEND_FRIEND_REQUEST'));
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    if (
      !window.confirm(
        t('PROFILE.REMOVE_FRIEND_CONFIRM', { username: friend.username })
      )
    ) {
      return;
    }

    try {
      await removeFriend({ friendUserId: friend.friendUserId }).unwrap();
      toast.success(t('PROFILE.REMOVED_FRIEND', { username: friend.username }));
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_REMOVE_FRIEND'));
    }
  };

  const handleAcceptRequest = async (
    requesterUserId: number,
    requesterUsername: string
  ) => {
    try {
      await acceptRequest({ requesterUserId }).unwrap();
      toast.success(t('PROFILE.ADDED_FRIEND', { username: requesterUsername }));
      refetchPending();
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_ACCEPT_REQUEST'));
    }
  };

  const handleRejectRequest = async (
    requesterUserId: number,
    requesterUsername: string
  ) => {
    try {
      await rejectRequest({ requesterUserId }).unwrap();
      toast.success(
        t('PROFILE.REJECTED_REQUEST', { username: requesterUsername })
      );
      refetchPending();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_REJECT_REQUEST'));
    }
  };

  const handleCancelRequest = async (
    recipientUserId: number,
    recipientUsername: string
  ) => {
    if (
      !window.confirm(
        t('PROFILE.CANCEL_REQUEST_CONFIRM', { username: recipientUsername })
      )
    ) {
      return;
    }

    try {
      await cancelRequest({ recipientUserId }).unwrap();
      toast.success(
        t('PROFILE.CANCELLED_REQUEST', { username: recipientUsername })
      );
      refetchSent();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_CANCEL_REQUEST'));
    }
  };

  const handleEditNickname = (friend: Friend) => {
    setNicknameEdit({
      friendUserId: friend.friendUserId,
      nickname: friend.nickname || ''
    });
  };

  const handleSaveNickname = async () => {
    if (nicknameEdit.friendUserId === null) return;

    try {
      await updateFriendNickname({
        friendUserId: nicknameEdit.friendUserId,
        nickname: nicknameEdit.nickname
      }).unwrap();
      toast.success(t('PROFILE.NICKNAME_UPDATED'));
      setNicknameEdit({ friendUserId: null, nickname: '' });
      refetchFriends();
    } catch (err: any) {
      toast.error(err.error || t('PROFILE.FAILED_UPDATE_NICKNAME'));
    }
  };

  const handleCancelNicknameEdit = () => {
    setNicknameEdit({ friendUserId: null, nickname: '' });
  };

  return (
    <article className={`${styles.friendsListContainer} ${className}`}>
      <h3 className={styles.title}>
        <button
          type="button"
          className={styles.titleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {t('PROFILE.FRIENDS_LIST')}
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
          {/* Add Friend Section */}
          <div className={styles.addFriendSection}>
            <div className={styles.searchContainer}>
              <input
                id="add-friend-search"
                name="add-friend-search"
                type="text"
                placeholder={t('PROFILE.SEARCH_ADD_PLACEHOLDER')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <UserSearchResults
              users={searchResults}
              isVisible={showSearchResults}
              isLoading={searchLoading}
              isMutating={isAddingFriend}
              unavailableUserIds={sentRequestUserIds}
              loadingText={t('PROFILE.SEARCHING')}
              noResultsText={t('PROFILE.NO_USERS_FOUND')}
              actionLabel={t('PROFILE.ADD_FRIEND')}
              unavailableActionLabel={t('PROFILE.FRIEND_REQUEST_ALREADY_SENT')}
              actionIcon={<MdPersonAdd />}
              unavailableActionIcon={<MdBlock />}
              onSelect={(user) => handleAddFriend(user.username)}
              styles={styles}
              actionClassName={styles.addButton}
              disabledActionClassName={styles.addButtonDisabled}
            />
          </div>

          {/* Sent Friend Requests Section */}
          {!sentLoading &&
            sentData?.sentRequests &&
            sentData.sentRequests.length > 0 && (
              <div className={styles.friendsTableContainer}>
                <h4 className={styles.subtitle}>
                  {t('PROFILE.PENDING_REQUESTS_SENT')}
                </h4>
                <table className={styles.friendsTable}>
                  <thead>
                    <tr>
                      <th scope="col">{t('PROFILE.SENT_TO')}</th>
                      <th scope="col" className={styles.actionColumnHeader}>
                        {t('PROFILE.ACTION')}
                      </th>
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
                                false,
                                request.metafyTiers
                              )
                                .filter((icon) => icon.condition)
                                .map((icon) => (
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
                            onClick={() =>
                              handleCancelRequest(
                                request.recipientUserId,
                                request.recipientUsername
                              )
                            }
                            title={t('PROFILE.CANCEL_FRIEND_REQUEST')}
                            aria-label={t('PROFILE.CANCEL_FRIEND_REQUEST')}
                            disabled={isCancellingRequest}
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
          {!pendingLoading &&
            pendingData?.requests &&
            pendingData.requests.length > 0 && (
              <div className={styles.friendsTableContainer}>
                <h4 className={styles.subtitle}>
                  {t('PROFILE.PENDING_REQUESTS')}
                </h4>
                <table className={styles.friendsTable}>
                  <thead>
                    <tr>
                      <th scope="col">{t('PROFILE.FROM')}</th>
                      <th scope="col" className={styles.actionColumnHeader}>
                        {t('PROFILE.ACTION')}
                      </th>
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
                                false,
                                request.metafyTiers
                              )
                                .filter((icon) => icon.condition)
                                .map((icon) => (
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
                            onClick={() =>
                              handleAcceptRequest(
                                request.requesterUserId,
                                request.requesterUsername
                              )
                            }
                            title={t('PROFILE.ACCEPT_FRIEND_REQUEST')}
                            aria-label={t('PROFILE.ACCEPT_FRIEND_REQUEST')}
                            disabled={isAcceptingRequest}
                          >
                            <MdCheckCircle fontSize="1.5em" />
                          </button>
                          <button
                            className={styles.rejectButton}
                            onClick={() =>
                              handleRejectRequest(
                                request.requesterUserId,
                                request.requesterUsername
                              )
                            }
                            title={t('PROFILE.REJECT_FRIEND_REQUEST')}
                            aria-label={t('PROFILE.REJECT_FRIEND_REQUEST')}
                            disabled={isRejectingRequest}
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
              <p className={styles.loadingText}>
                {t('PROFILE.LOADING_FRIENDS')}
              </p>
            ) : friendsData?.friends && friendsData.friends.length > 0 ? (
              <>
                <table className={styles.friendsTable}>
                  <thead>
                    <tr>
                      <th scope="col">{t('PROFILE.FRIEND')}</th>
                      <th scope="col" className={styles.actionColumnHeader}>
                        {t('PROFILE.ACTION')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {friendsData.friends.map((friend: Friend) => (
                      <tr key={friend.friendUserId}>
                        <td>
                          <div className={styles.friendNameContainer}>
                            <div className={styles.friendIcons}>
                              {createPatreonIconMap(
                                friend.isContributor,
                                friend.isPvtVoidPatron,
                                friend.isPatron,
                                false,
                                friend.metafyTiers
                              )
                                .filter((icon) => icon.condition)
                                .map((icon) => (
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
                            <span className={styles.username}>
                              {friend.username}
                            </span>
                            {friend.nickname && (
                              <span className={styles.nickname}>
                                ({friend.nickname})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.deleteColumn}>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEditNickname(friend)}
                            title={t('PROFILE.EDIT_NICKNAME')}
                            aria-label={t('PROFILE.EDIT_NICKNAME')}
                          >
                            <MdEdit fontSize="1.5em" />
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleRemoveFriend(friend)}
                            title={t('PROFILE.REMOVE_FRIEND')}
                            aria-label={t('PROFILE.REMOVE_FRIEND')}
                            disabled={isRemovingFriend}
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
            <div
              className={styles.modalOverlay}
              onClick={handleCancelNicknameEdit}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>{t('PROFILE.EDIT_NICKNAME_HEADING')}</h3>
                <input
                  id="friend-nickname"
                  name="friend-nickname"
                  type="text"
                  placeholder={t('PROFILE.NICKNAME_PLACEHOLDER')}
                  value={nicknameEdit.nickname}
                  onChange={(e) =>
                    setNicknameEdit({
                      ...nicknameEdit,
                      nickname: e.target.value
                    })
                  }
                  maxLength={50}
                  className={styles.nicknameInput}
                  autoFocus
                />
                <div className={styles.modalActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveNickname}
                    disabled={isUpdatingNickname}
                  >
                    {t('PROFILE.SAVE')}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={handleCancelNicknameEdit}
                  >
                    {t('PROFILE.CANCEL')}
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
