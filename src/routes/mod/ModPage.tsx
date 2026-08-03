import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ModPage.module.css';
import { toast } from 'react-hot-toast';
import {
  useGetModPageDataQuery,
  useBanPlayerByIPMutation,
  useBanIPDirectMutation,
  useBanPlayerByNameMutation,
  useCloseGameMutation,
  useDeleteUsernameMutation,
  useSendSystemMessageToPlayerMutation,
  useSendSystemMessageToAllMutation,
  useSyncMetafySubscribersMutation
} from 'features/api/apiSlice';
import UsernameModeration from './UsernameModeration';
import DeleteUsernameAutocomplete from './DeleteUsernameAutocomplete';
import { LinkedAccount } from 'interface/API/ModPageAPI';

const ModPage: React.FC = () => {
  const { t } = useTranslation();
  const [ipToBan, setIpToBan] = useState('');
  const [playerNumberToBan, setPlayerNumberToBan] = useState('');
  const [directIP, setDirectIP] = useState('');
  const [gameToClose, setGameToClose] = useState('');
  const [playerToBan, setPlayerToBan] = useState('');
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null
  );
  const [systemMsgUsername, setSystemMsgUsername] = useState('');
  const [systemMsgText, setSystemMsgText] = useState('');
  const [broadcastMsgText, setBroadcastMsgText] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use RTK Query hooks
  const {
    data: modPageData,
    isLoading,
    error: fetchError,
    refetch
  } = useGetModPageDataQuery(undefined);

  const [banByIP, { isLoading: isBanningByIP }] = useBanPlayerByIPMutation();
  const [banIPDirect, { isLoading: isBanningIPDirect }] =
    useBanIPDirectMutation();
  const [banByName, { isLoading: isBanningByName }] =
    useBanPlayerByNameMutation();
  const [closeGameMutation, { isLoading: isClosingGame }] =
    useCloseGameMutation();
  const [deleteUsername, { isLoading: isDeletingUsername }] =
    useDeleteUsernameMutation();
  const [sendToPlayer, { isLoading: isSendingToPlayer }] =
    useSendSystemMessageToPlayerMutation();
  const [sendToAll, { isLoading: isSendingToAll }] =
    useSendSystemMessageToAllMutation();
  const [syncMetafy, { isLoading: isSyncingMetafy }] =
    useSyncMetafySubscribersMutation();
  const [metafySyncResult, setMetafySyncResult] = useState<any>(null);

  const handleBanByIP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await banByIP({ ipToBan, playerNumberToBan }).unwrap();
      setSuccessMessage(t('MOD_PAGE.PLAYER_BANNED_BY_IP_SUCCESS'));
      setIpToBan('');
      setPlayerNumberToBan('');
      // Refresh data after successful ban
      await refetch();
    } catch (err: any) {
      console.error('Failed to ban player:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleBanIPDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      const response = await banIPDirect({
        directIPToBan: directIP.trim()
      }).unwrap();
      if (response?.status === 'error') {
        toast.error(response.message || t('MOD_PAGE.FAILED_TO_BAN_IP'), {
          position: 'top-center'
        });
        return;
      }
      setSuccessMessage(
        response?.message || t('MOD_PAGE.IP_BANNED_SUCCESS', { ip: directIP })
      );
      setDirectIP('');
      await refetch();
    } catch (err: any) {
      console.error('Failed to ban IP:', err);
    }
  };

  const handleCloseGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await closeGameMutation({ gameToClose }).unwrap();
      setSuccessMessage(t('MOD_PAGE.GAME_CLOSED_SUCCESS'));
      setGameToClose('');
    } catch (err: any) {
      console.error('Failed to close game:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleBanPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await banByName({ playerToBan }).unwrap();
      setSuccessMessage(t('MOD_PAGE.PLAYER_BANNED_SUCCESS'));
      setPlayerToBan('');
      // Refresh data after successful ban
      await refetch();
    } catch (err: any) {
      console.error('Failed to ban player:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleDeleteUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!usernameToDelete.trim()) {
      toast.error(t('MOD_PAGE.PLEASE_ENTER_USERNAME'), {
        position: 'top-center'
      });
      return;
    }

    try {
      console.log(
        '[ModPage Delete Username] Starting deletion for:',
        usernameToDelete
      );
      const response = await deleteUsername({ usernameToDelete }).unwrap();

      // Show success toast
      toast.success(
        response.message || t('MOD_PAGE.USERNAME_DELETED_SUCCESS'),
        {
          style: {
            minWidth: '300px'
          },
          position: 'top-center'
        }
      );

      setSuccessMessage(
        response.message || t('MOD_PAGE.USERNAME_DELETED_SUCCESS')
      );
      setUsernameToDelete('');
      setSelectedUserEmail(null);
    } catch (err: any) {
      console.error('[ModPage Delete Username] Error response:', {
        errorObject: err,
        message: err?.message,
        error: err?.error,
        status: err?.status,
        data: err?.data,
        toString: err?.toString()
      });

      const errorMessage =
        err?.data?.message ||
        err?.message ||
        err?.error ||
        err?.toString() ||
        t('MOD_PAGE.UNKNOWN_ERROR');

      // Show error toast
      toast.error(
        t('MOD_PAGE.ERROR_DELETING_USERNAME', { message: errorMessage }),
        {
          style: {
            minWidth: '300px'
          },
          position: 'top-center'
        }
      );
    }
  };

  const handleSendSystemMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!systemMsgUsername.trim() || !systemMsgText.trim()) {
      toast.error(t('MOD_PAGE.USERNAME_AND_MESSAGE_REQUIRED'), {
        position: 'top-center'
      });
      return;
    }

    try {
      const result = await sendToPlayer({
        username: systemMsgUsername,
        message: systemMsgText
      }).unwrap();
      toast.success(result.message || t('MOD_PAGE.SYSTEM_MESSAGE_SENT'), {
        position: 'top-center'
      });
      setSuccessMessage(result.message || t('MOD_PAGE.SYSTEM_MESSAGE_SENT'));
      setSystemMsgUsername('');
      setSystemMsgText('');
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || t('MOD_PAGE.FAILED_TO_SEND_SYSTEM_MESSAGE');
      toast.error(errorMessage, { position: 'top-center' });
    }
  };

  const handleBroadcastMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!broadcastMsgText.trim()) {
      toast.error(t('MOD_PAGE.MESSAGE_REQUIRED'), { position: 'top-center' });
      return;
    }

    if (!window.confirm(t('MOD_PAGE.CONFIRM_SEND_TO_ALL'))) {
      return;
    }

    try {
      const result = await sendToAll({ message: broadcastMsgText }).unwrap();
      toast.success(result.message || t('MOD_PAGE.BROADCAST_SENT'), {
        position: 'top-center'
      });
      setSuccessMessage(result.message || t('MOD_PAGE.BROADCAST_SENT'));
      setBroadcastMsgText('');
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || t('MOD_PAGE.FAILED_TO_SEND_BROADCAST');
      toast.error(errorMessage, { position: 'top-center' });
    }
  };

  const handleSyncMetafy = async () => {
    setSuccessMessage(null);
    setMetafySyncResult(null);

    if (!window.confirm(t('MOD_PAGE.CONFIRM_SYNC_METAFY'))) {
      return;
    }

    try {
      const result = await syncMetafy().unwrap();
      setMetafySyncResult(result);
      if (result?.error) {
        toast.error(result.error, { position: 'top-center', duration: 8000 });
      } else {
        toast.success(
          t('MOD_PAGE.SYNC_COMPLETE_COUNT', { count: result?.cleared ?? 0 }),
          { position: 'top-center' }
        );
        setSuccessMessage(
          t('MOD_PAGE.SYNC_COMPLETE_SUMMARY', {
            cleared: result?.cleared ?? 0,
            active: result?.stillActive ?? 0
          })
        );
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.error ||
        err?.data?.apiError ||
        t('MOD_PAGE.FAILED_TO_SYNC_METAFY');
      toast.error(errorMessage, { position: 'top-center' });
      if (err?.data) setMetafySyncResult(err.data);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.modPagePanel}>
        <h1 className={styles.title}>{t('MOD_PAGE.MODERATOR_PANEL')}</h1>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <form onSubmit={handleBanByIP} className={styles.form}>
              <h2>{t('MOD_PAGE.IP_BAN_FROM_GAME')}</h2>
              <label htmlFor="ipToBan">
                {t('MOD_PAGE.GAME_TO_IP_BAN_FROM')}
              </label>
              <input
                type="text"
                id="ipToBan"
                value={ipToBan}
                onChange={(e) => setIpToBan(e.target.value)}
                required
              />
              <label htmlFor="playerNumberToBan">
                {t('MOD_PAGE.PLAYER_TO_BAN')}
              </label>
              <input
                type="text"
                id="playerNumberToBan"
                value={playerNumberToBan}
                onChange={(e) => setPlayerNumberToBan(e.target.value)}
                required
              />
              <button type="submit">{t('USERNAME_MODERATION.BAN')}</button>
            </form>

            <form onSubmit={handleBanIPDirect} className={styles.form}>
              <h2>{t('MOD_PAGE.BAN_IP_ADDRESS')}</h2>
              <label htmlFor="directIP">
                {t('MOD_PAGE.IP_ADDRESS_TO_BAN')}
              </label>
              <input
                type="text"
                id="directIP"
                value={directIP}
                onChange={(e) => setDirectIP(e.target.value)}
                placeholder={t('MOD_PAGE.IP_PLACEHOLDER')}
                required
              />
              <button type="submit" disabled={isBanningIPDirect}>
                {isBanningIPDirect
                  ? t('MOD_PAGE.BANNING')
                  : t('MOD_PAGE.BAN_IP')}
              </button>
            </form>

            <form onSubmit={handleCloseGame} className={styles.form}>
              <h2>{t('MOD_PAGE.CLOSE_GAME')}</h2>
              <label htmlFor="gameToClose">{t('MOD_PAGE.GAME_TO_CLOSE')}</label>
              <input
                type="text"
                id="gameToClose"
                value={gameToClose}
                onChange={(e) => setGameToClose(e.target.value)}
                required
              />
              <button type="submit">{t('MOD_PAGE.CLOSE_GAME')}</button>
            </form>

            <form onSubmit={handleBanPlayer} className={styles.form}>
              <h2>{t('MOD_PAGE.BAN_PLAYER_BY_USERNAME')}</h2>
              <label htmlFor="playerToBan">{t('MOD_PAGE.PLAYER_TO_BAN')}</label>
              <input
                type="text"
                id="playerToBan"
                value={playerToBan}
                onChange={(e) => setPlayerToBan(e.target.value)}
                required
              />
              <button type="submit">{t('USERNAME_MODERATION.BAN')}</button>
            </form>

            <form onSubmit={handleDeleteUsername} className={styles.form}>
              <h2>{t('MOD_PAGE.DELETE_USERNAME_FROM_DATABASE')}</h2>
              <label htmlFor="usernameToDelete">
                {t('MOD_PAGE.USERNAME_TO_DELETE')}
              </label>
              <DeleteUsernameAutocomplete
                value={usernameToDelete}
                onChange={(newValue) => setUsernameToDelete(newValue)}
                onSelect={(username, email) => {
                  setUsernameToDelete(username);
                  setSelectedUserEmail(email);
                }}
              />
              <button
                type="submit"
                disabled={isDeletingUsername || !usernameToDelete.trim()}
              >
                {isDeletingUsername
                  ? t('MOD_PAGE.DELETING')
                  : t('MOD_PAGE.DELETE_USERNAME')}
              </button>
            </form>

            <form onSubmit={handleSendSystemMessage} className={styles.form}>
              <h2>{t('MOD_PAGE.SEND_SYSTEM_MESSAGE_TO_PLAYER')}</h2>
              <label htmlFor="systemMsgUsername">
                {t('MOD_PAGE.USERNAME_LABEL')}
              </label>
              <input
                type="text"
                id="systemMsgUsername"
                value={systemMsgUsername}
                onChange={(e) => setSystemMsgUsername(e.target.value)}
                required
              />
              <label htmlFor="systemMsgText">
                {t('MOD_PAGE.MESSAGE_LABEL')}
              </label>
              <textarea
                id="systemMsgText"
                value={systemMsgText}
                onChange={(e) => setSystemMsgText(e.target.value)}
                required
                rows={4}
                maxLength={2000}
                className={styles.textarea}
              />
              <button type="submit" disabled={isSendingToPlayer}>
                {isSendingToPlayer
                  ? t('MOD_PAGE.SENDING')
                  : t('MOD_PAGE.SEND_MESSAGE')}
              </button>
            </form>

            <form onSubmit={handleBroadcastMessage} className={styles.form}>
              <h2>{t('MOD_PAGE.BROADCAST_TO_ALL_PLAYERS')}</h2>
              <label htmlFor="broadcastMsgText">
                {t('MOD_PAGE.MESSAGE_LABEL')}
              </label>
              <textarea
                id="broadcastMsgText"
                value={broadcastMsgText}
                onChange={(e) => setBroadcastMsgText(e.target.value)}
                required
                rows={4}
                maxLength={2000}
                className={styles.textarea}
              />
              <button type="submit" disabled={isSendingToAll}>
                {isSendingToAll
                  ? t('MOD_PAGE.SENDING')
                  : t('MOD_PAGE.BROADCAST_TO_ALL')}
              </button>
            </form>

            <div className={styles.form}>
              <h2>{t('MOD_PAGE.SYNC_METAFY_SUBSCRIBERS')}</h2>
              <p
                style={{
                  color: '#ccc',
                  fontSize: '13px',
                  marginBottom: '10px'
                }}
              >
                {t('MOD_PAGE.SYNC_METAFY_DESCRIPTION')}
              </p>
              <button
                onClick={handleSyncMetafy}
                disabled={isSyncingMetafy}
                style={{ backgroundColor: '#FF9800' }}
              >
                {isSyncingMetafy
                  ? t('MOD_PAGE.SYNCING')
                  : t('MOD_PAGE.SYNC_METAFY_SUBSCRIBERS')}
              </button>
              {metafySyncResult && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '3px',
                    borderLeft: `3px solid ${
                      metafySyncResult.error
                        ? '#f44336'
                        : (metafySyncResult.cleared ?? 0) > 0
                        ? '#FF9800'
                        : '#00ff00'
                    }`
                  }}
                >
                  <p
                    style={{
                      color: metafySyncResult.error ? '#f44336' : '#00ff00',
                      fontWeight: 'bold',
                      marginBottom: '6px'
                    }}
                  >
                    {metafySyncResult.error
                      ? t('MOD_PAGE.SYNC_ERROR')
                      : t('MOD_PAGE.SYNC_COMPLETE')}
                  </p>
                  {metafySyncResult.error && (
                    <p
                      style={{
                        color: '#f44336',
                        fontSize: '13px',
                        marginBottom: '6px'
                      }}
                    >
                      {metafySyncResult.error}
                    </p>
                  )}
                  {metafySyncResult.apiError && (
                    <p
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginBottom: '4px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {metafySyncResult.apiError}
                    </p>
                  )}
                  {metafySyncResult.hint && (
                    <p
                      style={{
                        color: '#FF9800',
                        fontSize: '12px',
                        marginBottom: '6px'
                      }}
                    >
                      {t('MOD_PAGE.SYNC_HINT')} {metafySyncResult.hint}
                    </p>
                  )}
                  {metafySyncResult.apiWarning && (
                    <p
                      style={{
                        color: '#FF9800',
                        fontSize: '12px',
                        marginBottom: '6px'
                      }}
                    >
                      {t('MOD_PAGE.API_WARNING')} {metafySyncResult.apiWarning}
                    </p>
                  )}
                  <p
                    style={{
                      color: '#00bcd4',
                      fontSize: '13px',
                      marginBottom: '6px'
                    }}
                  >
                    {t('MOD_PAGE.FETCHED_SUBSCRIBERS', {
                      count: metafySyncResult.subscribersFetched ?? 0,
                      apiSource: metafySyncResult.apiSource
                        ? ` via ${metafySyncResult.apiSource}`
                        : ''
                    })}
                  </p>
                  <table style={{ fontSize: '13px', color: '#ddd' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 10px' }}>
                          {t('MOD_PAGE.USERS_WITH_TALISHAR_IN_DB')}:
                        </td>
                        <td>
                          <strong>{metafySyncResult.usersChecked ?? 0}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 10px' }}>
                          {t('MOD_PAGE.STILL_ACTIVE')}:
                        </td>
                        <td style={{ color: '#00ff00' }}>
                          <strong>{metafySyncResult.stillActive ?? 0}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 10px' }}>
                          {t('MOD_PAGE.EXPIRED_CLEARED')}:
                        </td>
                        <td style={{ color: '#FF9800' }}>
                          <strong>{metafySyncResult.cleared ?? 0}</strong>
                        </td>
                      </tr>
                      {(metafySyncResult.backfilled ?? 0) > 0 && (
                        <tr>
                          <td style={{ padding: '2px 10px' }}>
                            {t('MOD_PAGE.METAFY_ID_BACKFILLED')}:
                          </td>
                          <td style={{ color: '#00bcd4' }}>
                            <strong>{metafySyncResult.backfilled}</strong>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '2px 10px' }}>
                          {t('MOD_PAGE.SKIPPED_NO_METAFY_ID')}:
                        </td>
                        <td style={{ color: '#aaa' }}>
                          <strong>
                            {metafySyncResult.skippedNoMetafyId ?? 0}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {metafySyncResult.clearedUsers?.length > 0 && (
                    <p
                      style={{
                        marginTop: '8px',
                        color: '#FF9800',
                        fontSize: '12px'
                      }}
                    >
                      <strong>{t('MOD_PAGE.CLEARED')}:</strong>{' '}
                      {metafySyncResult.clearedUsers.join(', ')}
                    </p>
                  )}
                  {metafySyncResult.skippedUsers?.length > 0 && (
                    <p
                      style={{
                        marginTop: '4px',
                        color: '#aaa',
                        fontSize: '12px'
                      }}
                    >
                      <strong>{t('MOD_PAGE.SKIPPED')}:</strong>{' '}
                      {metafySyncResult.skippedUsers.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.middleColumn}>
            <div className={styles.dataSection}>
              <h2>{t('MOD_PAGE.MOST_RECENTLY_CREATED_ACCOUNTS')}</h2>
              {isLoading ? (
                <p>{t('MOD_PAGE.LOADING')}</p>
              ) : modPageData?.recentAccounts &&
                modPageData.recentAccounts.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.recentAccounts.map(
                    (account: string, index: number) => (
                      <li key={index}>{account}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>{t('MOD_PAGE.NO_RECENT_ACCOUNTS')}</p>
              )}
            </div>

            <div className={styles.dataSection}>
              <h2>{t('MOD_PAGE.POSSIBLE_BAN_EVADERS')}</h2>
              {isLoading ? (
                <p>{t('MOD_PAGE.LOADING')}</p>
              ) : modPageData?.linkedAccounts &&
                modPageData.linkedAccounts.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.linkedAccounts.map(
                    (link: LinkedAccount, index: number) => (
                      <li key={index}>
                        <strong>{link.username}</strong> - {link.ip} (
                        {link.linkedTo === 'banned IP'
                          ? t('MOD_PAGE.BANNED_IP')
                          : t('MOD_PAGE.SHARES_IP_WITH', {
                              username: link.linkedTo
                            })}
                        )
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>{t('MOD_PAGE.NO_LINKED_ACCOUNTS')}</p>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.dataSection}>
              <h2>{t('MOD_PAGE.BANNED_PLAYERS')}</h2>
              {isLoading ? (
                <p>{t('MOD_PAGE.LOADING')}</p>
              ) : modPageData?.bannedPlayers &&
                modPageData.bannedPlayers.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.bannedPlayers.map(
                    (player: string, index: number) => {
                      const knownIPs =
                        modPageData.bannedPlayerIPs?.[player.toLowerCase()];
                      return (
                        <li key={index}>
                          {player}
                          {knownIPs && knownIPs.length > 0 && (
                            <span style={{ color: '#aaa', fontSize: '12px' }}>
                              {' - '}
                              {knownIPs.map((ip: string, ipIndex: number) => (
                                <React.Fragment key={ip}>
                                  {ipIndex > 0 && ', '}
                                  <a
                                    onClick={() => setDirectIP(ip)}
                                    title={t(
                                      'MOD_PAGE.CLICK_TO_FILL_BAN_IP_FORM'
                                    )}
                                    style={{
                                      cursor: 'pointer',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    {ip}
                                  </a>
                                </React.Fragment>
                              ))}
                            </span>
                          )}
                        </li>
                      );
                    }
                  )}
                </ul>
              ) : (
                <p>{t('MOD_PAGE.NO_BANNED_PLAYERS')}</p>
              )}
            </div>

            <div className={styles.dataSection}>
              <h2>{t('MOD_PAGE.BANNED_IPS')}</h2>
              {isLoading ? (
                <p>{t('MOD_PAGE.LOADING')}</p>
              ) : modPageData?.bannedIPs && modPageData.bannedIPs.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.bannedIPs.map((ip: string, index: number) => (
                    <li key={index}>{ip}</li>
                  ))}
                </ul>
              ) : (
                <p>{t('MOD_PAGE.NO_BANNED_IPS')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Username Moderation Section */}
      <UsernameModeration />
    </div>
  );
};

export default ModPage;
