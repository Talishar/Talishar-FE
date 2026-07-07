import { usePageTitle } from 'hooks/usePageTitle';
import {
  useDeleteAccountMutation,
  useGetUserProfileQuery,
  useChangeDisplayNameMutation
} from 'features/api/apiSlice';
import { DeleteAccountAPIResponse } from 'interface/API/DeleteAccountAPI.php';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import styles from './profile.module.css';
import FriendsList from './FriendsList';
import BlockedUsers from './BlockedUsers';
import MetafySection from './MetafySection';
import UpgradeSection from './UpgradeSection';
import useAuth from 'hooks/useAuth';

const CODE = 'code';
const CLIENT_ID =
  'UMs7_V2SPi656fczWY0SDtg9M3RJy-gd4H95h7fd05BUJ2UMnd0IM77dp0ZAtBng';
const REDIRECT_URI = 'https://talishar.net/user/profile/linkpatreon';
const SCOPE = 'identity identity.memberships';
const PATREON_URL = 'https://www.patreon.com/oauth2/authorize?';

export const ProfilePage = () => {
  usePageTitle('Profile');
  const { currentUserId } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationUsername, setConfirmationUsername] = useState('');
  const {
    data: profileData,
    isLoading: profileIsLoading,
    refetch: profileRefetch
  } = useGetUserProfileQuery(undefined);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [changeDisplayName, { isLoading: isChangingName }] =
    useChangeDisplayNameMutation();
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showDisplayNameInfo, setShowDisplayNameInfo] = useState(false);

  const handleChangeDisplayName = async (displayName: string) => {
    try {
      const resp = await changeDisplayName({ displayName }).unwrap();
      if (resp.status === 'success') {
        toast.success(
          displayName === ''
            ? 'Display name reset to your username.'
            : `Display name changed to ${resp.displayName}.`,
          { position: 'top-center' }
        );
        setIsEditingDisplayName(false);
        setNewDisplayName('');
      } else {
        toast.error(resp.message ?? 'Failed to change display name.', {
          position: 'top-center'
        });
      }
    } catch (err: any) {
      const message =
        err?.data?.message ?? 'Failed to change display name. Please try again.';
      toast.error(message, { position: 'top-center' });
    }
  };

  const nameChangeCooldownActive =
    !!profileData?.nextChangeAllowed &&
    new Date(profileData.nextChangeAllowed).getTime() > Date.now();

  const handleDeleteAccountConfirm = async () => {
    if (!confirmationUsername) {
      toast.error('Please enter your username to confirm deletion', {
        position: 'top-center'
      });
      return;
    }

    try {
      const response = await deleteAccount({
        confirmationUsername
      }).unwrap();

      if (!response.success) {
        toast.error(`Error: ${response.message}`, {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        });
        return;
      }

      toast.success(response.message, {
        style: {
          minWidth: '250px'
        },
        position: 'top-center'
      });

      // Force a hard refresh to clear all app state after account deletion
      setTimeout(() => {
        window.location.href = '/user/login';
      }, 1000);
    } catch (err) {
      console.warn(err);
      toast.error(
        `Error deleting account: ${err?.toString() || 'Unknown error'}`,
        {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        }
      );
    }
  };

  const PatreonOAuthParam = new URLSearchParams();
  PatreonOAuthParam.append('response_type', CODE);
  PatreonOAuthParam.append('client_id', CLIENT_ID);
  PatreonOAuthParam.append('redirect_uri', REDIRECT_URI);
  PatreonOAuthParam.append('scope', SCOPE);

  const isMetafySupporter: boolean = profileData?.isMetafySupporter ?? false;

  return (
    <div>
      <div className={styles.wideContainer}>
        <h1 className={styles.title}>Profile Page</h1>
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <article className={styles.articleTitle}>
              <div className={styles.usernameHeader}>
                <span className={styles.usernameLabel}>Username</span>
                <h2 className={styles.usernameValue}>{profileData?.userName}</h2>
                {currentUserId && (
                  <div className={styles.userIdLine}>
                    <span className={styles.userIdLabel}>User ID</span>
                    <span className={styles.userIdValue}>{currentUserId}</span>
                  </div>
                )}
              </div>
              <div>
                {profileIsLoading && <p>Loading Profile...</p>}

                {/* Show Upgrade/Supporter Status */}
                <UpgradeSection
                  isSupporter={isMetafySupporter}
                  userName={profileData?.userName}
                  isOwner={
                    profileData?.userName === 'PvtVoid' ||
                    profileData?.userName === 'OotTheMonk'
                  }
                />

                {/* Metafy Section */}
                {profileData?.metafyInfo && (
                  <MetafySection
                    isMetafyLinked={profileData?.isMetafyLinked ?? false}
                    metafyCommunities={profileData?.metafyCommunities ?? []}
                    metafyInfo={profileData?.metafyInfo ?? ''}
                  />
                )}

                {/* Patreon Section */}
                {!profileIsLoading && (
                  <div className={styles.patreonSection}>
                    <h3>Patreon</h3>
                    {profileData?.isPatreonLinked ? (
                      <p>
                        Your Patreon account is linked. <br />
                        <a href={PATREON_URL + PatreonOAuthParam.toString()}>
                          Refresh your Patreon connection
                        </a>
                      </p>
                    ) : (
                      <p>
                        <a href={PATREON_URL + PatreonOAuthParam.toString()}>
                          Connect to Patreon
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Display Name Section */}
              {!profileIsLoading && (
                <div className={styles.patreonSection}>
                  <div className={styles.displayNameHeader}>
                    <h3>Display Name</h3>
                    <button
                      type="button"
                      className={styles.infoButton}
                      onClick={() => setShowDisplayNameInfo((prev) => !prev)}
                      aria-label="More information about display names"
                      aria-expanded={showDisplayNameInfo}
                    >
                      i
                    </button>
                  </div>
                  <p>
                    Shown to other players in games, lobbies, and chat:{' '}
                    <strong>
                      {profileData?.displayName ?? profileData?.userName}
                    </strong>
                  </p>
                  {showDisplayNameInfo && (
                    <div className={styles.displayNameInfoBox}>
                      <p>
                        Your display name is what other players see in games,
                        lobbies, and chat. Your account username is kept
                        private and is only ever visible to moderators.
                      </p>
                      <p>
                        Display names must be 3-20 letters or numbers, can't
                        match another player's username or display name, and
                        can only be changed once every 7 days.
                      </p>
                    </div>
                  )}
                  {profileData?.canChangeDisplayName ? (
                    isEditingDisplayName ? (
                      <div className={styles.displayNameEditRow}>
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          placeholder="New display name (3-20 letters/numbers)"
                          maxLength={20}
                          className={styles.displayNameInput}
                          disabled={isChangingName}
                        />
                        <button
                          className={styles.metafyToggleButton}
                          onClick={() =>
                            handleChangeDisplayName(newDisplayName.trim())
                          }
                          disabled={
                            isChangingName || newDisplayName.trim().length < 3
                          }
                        >
                          {isChangingName ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className={styles.metafyToggleButton}
                          onClick={() => {
                            setIsEditingDisplayName(false);
                            setNewDisplayName('');
                          }}
                          disabled={isChangingName}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : nameChangeCooldownActive ? (
                      <p>
                        You can change your display name again on{' '}
                        {new Date(
                          profileData.nextChangeAllowed as string
                        ).toLocaleString()}
                        .
                      </p>
                    ) : (
                      <div className={styles.displayNameEditRow}>
                        <button
                          className={styles.metafyToggleButton}
                          onClick={() => setIsEditingDisplayName(true)}
                        >
                          Change Display Name
                        </button>
                        {profileData?.hasCustomDisplayName && (
                          <button
                            className={styles.metafyToggleButton}
                            onClick={() => handleChangeDisplayName('')}
                            disabled={isChangingName}
                          >
                            Reset to Username
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <p>
                      Changing your display name is a supporter perk.
                      Support Talishar to unlock it!
                    </p>
                  )}
                </div>
              )}

              <h3 className={styles.title}>Delete Account</h3>
              <p style={{ color: '#fa3737ff', marginBottom: '1em' }}>
                <strong>Warning:</strong> This action is permanent and cannot be
                undone. All your account data will be deleted.
              </p>
              <button
                className={styles.deleteAccountButton}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>

              {showDeleteModal && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <h4>Delete Account Confirmation</h4>
                    <p>
                      Are you sure you want to delete your account? This action
                      is <strong>permanent</strong> and cannot be undone.
                    </p>
                    <p>
                      Please type your username{' '}
                      <strong>{profileData?.userName}</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={confirmationUsername}
                      onChange={(e) => setConfirmationUsername(e.target.value)}
                      className={styles.modalInput}
                    />
                    <div className={styles.modalButtons}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          setShowDeleteModal(false);
                          setConfirmationUsername('');
                        }}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.confirmDeleteButton}
                        onClick={handleDeleteAccountConfirm}
                        disabled={
                          isDeleting ||
                          confirmationUsername !== profileData?.userName
                        }
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
          <div className={styles.rightColumn}>
            <FriendsList className={styles.friendsSection} />
            <BlockedUsers className={styles.friendsSection} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
