import { usePageTitle } from 'hooks/usePageTitle';
import { Trans, useTranslation } from 'react-i18next';
import {
  useDeleteAccountMutation,
  useGetUserProfileQuery,
  useChangeDisplayNameMutation,
  useSetMatchResultWebhookMutation
} from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
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
  const { t } = useTranslation();
  usePageTitle(t('PAGES.PROFILE'));
  const { currentUserId } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationUsername, setConfirmationUsername] = useState('');
  const { data: profileData, isLoading: profileIsLoading } =
    useGetUserProfileQuery(undefined);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [changeDisplayName, { isLoading: isChangingName }] =
    useChangeDisplayNameMutation();
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showDisplayNameInfo, setShowDisplayNameInfo] = useState(false);
  const [webhookInput, setWebhookInput] = useState('');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [setMatchResultWebhook] = useSetMatchResultWebhookMutation();

  useEffect(() => {
    if (profileData?.matchResultWebhookUrl !== undefined) {
      setWebhookInput(profileData.matchResultWebhookUrl ?? '');
    }
  }, [profileData?.matchResultWebhookUrl]);

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      const resp = await setMatchResultWebhook({
        webhookUrl: webhookInput.trim()
      }).unwrap();
      if (resp.success) {
        toast.success(resp.message, { position: 'top-center' });
      } else {
        toast.error(resp.message, { position: 'top-center' });
      }
    } catch {
      toast.error('Failed to save webhook. Please try again.', {
        position: 'top-center'
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

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
        err?.data?.message ??
        'Failed to change display name. Please try again.';
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
        <h1 className={styles.title}>{t('PROFILE.PAGE_TITLE')}</h1>
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <article className={styles.articleTitle}>
              <div className={styles.usernameHeader}>
                <span className={styles.usernameLabel}>
                  {t('PROFILE.USERNAME_LABEL')}
                </span>
                <h2 className={styles.usernameValue}>
                  {profileData?.userName}
                </h2>
                {currentUserId && (
                  <div className={styles.userIdLine}>
                    <span className={styles.userIdLabel}>
                      {t('PROFILE.USER_ID_LABEL')}
                    </span>
                    <span className={styles.userIdValue}>{currentUserId}</span>
                  </div>
                )}
              </div>
              <div className={styles.accountOverview}>
                {profileIsLoading && <p>{t('PROFILE.LOADING')}</p>}

                {/* Show Upgrade/Supporter Status */}
                <UpgradeSection isSupporter={isMetafySupporter} />

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
                  <div
                    className={`${styles.patreonSection} ${
                      !profileData?.isPatreonLinked ? styles.connectionRow : ''
                    }`}
                  >
                    <h3>{t('PROFILE.PATREON_TITLE')}</h3>
                    {profileData?.isPatreonLinked ? (
                      <p>
                        <Trans
                          i18nKey="PROFILE.PATREON_LINKED"
                          components={{
                            1: <br />,
                            2: (
                              <a
                                href={
                                  PATREON_URL + PatreonOAuthParam.toString()
                                }
                              />
                            )
                          }}
                        />
                      </p>
                    ) : (
                      <p>
                        <a href={PATREON_URL + PatreonOAuthParam.toString()}>
                          {t('PROFILE.CONNECT_PATREON')}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Match Result Webhook */}
                {!profileIsLoading && (
                  <div className={styles.webhookSection}>
                    <h3>Match Result Webhook</h3>
                    <p>
                      Receive your match results at a custom URL after each
                      game. Must be a public https:// address.
                    </p>
                    <div className={styles.webhookInputRow}>
                      <input
                        type="url"
                        placeholder="https://your-webhook.example.com/results"
                        value={webhookInput}
                        onChange={(e) => setWebhookInput(e.target.value)}
                        disabled={isSavingWebhook}
                        className={styles.webhookInput}
                      />
                      <button
                        className={styles.metafyToggleButton}
                        onClick={handleSaveWebhook}
                        disabled={isSavingWebhook}
                      >
                        {isSavingWebhook ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Name Section */}
              {!profileIsLoading && (
                <section className={styles.displayNameSection}>
                  <div className={styles.displayNameHeader}>
                    <h3>{t('PROFILE.DISPLAY_NAME_TITLE')}</h3>
                    <button
                      type="button"
                      className={styles.infoButton}
                      onClick={() => setShowDisplayNameInfo((prev) => !prev)}
                      aria-label={t('PROFILE.DISPLAY_NAME_INFO_ARIA')}
                      aria-expanded={showDisplayNameInfo}
                    >
                      i
                    </button>
                  </div>
                  <p>
                    {t('PROFILE.DISPLAY_NAME_SHOWN_HINT')}{' '}
                    <strong>
                      {profileData?.displayName ?? profileData?.userName}
                    </strong>
                  </p>
                  {showDisplayNameInfo && (
                    <div className={styles.displayNameInfoBox}>
                      <p>{t('PROFILE.DISPLAY_NAME_INFO_1')}</p>
                      <p>{t('PROFILE.DISPLAY_NAME_INFO_2')}</p>
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
                          className={`${styles.metafyToggleButton} ${styles.secondaryButton}`}
                          onClick={() => {
                            setIsEditingDisplayName(false);
                            setNewDisplayName('');
                          }}
                          disabled={isChangingName}
                        >
                          {t('PROFILE.CANCEL')}
                        </button>
                      </div>
                    ) : nameChangeCooldownActive ? (
                      <p>
                        {t('PROFILE.CHANGE_AGAIN_ON', {
                          date: new Date(
                            profileData.nextChangeAllowed as string
                          ).toLocaleString()
                        })}
                      </p>
                    ) : (
                      <div className={styles.displayNameEditRow}>
                        <button
                          className={styles.metafyToggleButton}
                          onClick={() => setIsEditingDisplayName(true)}
                        >
                          {t('PROFILE.CHANGE_DISPLAY_NAME')}
                        </button>
                        {profileData?.hasCustomDisplayName && (
                          <button
                            className={`${styles.metafyToggleButton} ${styles.secondaryButton}`}
                            onClick={() => handleChangeDisplayName('')}
                            disabled={isChangingName}
                          >
                            {t('PROFILE.RESET_TO_USERNAME')}
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <p>{t('PROFILE.SUPPORTER_PERK')}</p>
                  )}
                </section>
              )}

              <section className={styles.dangerSection}>
                <h3 className={styles.title}>{t('PROFILE.DELETE_ACCOUNT')}</h3>
                <p className={styles.deleteWarning}>
                  <Trans
                    i18nKey="PROFILE.DELETE_WARNING"
                    components={{ 1: <strong /> }}
                  />
                </p>
                <button
                  className={styles.deleteAccountButton}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t('PROFILE.DELETE_MY_ACCOUNT')}
                </button>
              </section>

              {showDeleteModal && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <h4>{t('PROFILE.DELETE_CONFIRMATION_TITLE')}</h4>
                    <p>
                      <Trans
                        i18nKey="PROFILE.DELETE_CONFIRM"
                        components={{ 1: <strong /> }}
                      />
                    </p>
                    <p>
                      <Trans
                        i18nKey="PROFILE.DELETE_TYPE_USERNAME"
                        values={{ userName: profileData?.userName }}
                        components={{ 2: <strong /> }}
                      />
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
                        {t('PROFILE.CANCEL')}
                      </button>
                      <button
                        className={styles.confirmDeleteButton}
                        onClick={handleDeleteAccountConfirm}
                        disabled={
                          isDeleting ||
                          confirmationUsername !== profileData?.userName
                        }
                      >
                        {isDeleting
                          ? t('PROFILE.DELETING')
                          : t('PROFILE.DELETE_ACCOUNT')}
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
