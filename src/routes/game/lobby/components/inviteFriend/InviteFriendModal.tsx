import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetFriendsListQuery,
  useSendGameInviteMutation
} from 'features/api/apiSlice';
import { Friend, FriendOnlineStatus } from 'interface/API/FriendListAPI.php';
import Notice from 'components/Notice';
import modalStyles from 'components/ConfirmModal/ConfirmModal.module.css';
import styles from './InviteFriendModal.module.css';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameID: number;
  authKey: string;
}

const STATUS_ORDER: Record<FriendOnlineStatus, number> = {
  online: 0,
  playing: 1,
  offline: 2
};

type InviteState = 'sending' | 'sent';

const InviteFriendModal = ({
  isOpen,
  onClose,
  gameID,
  authKey
}: InviteFriendModalProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const { data, isLoading, refetch } = useGetFriendsListQuery(undefined, {
    skip: !isOpen
  });
  const [sendGameInvite] = useSendGameInviteMutation();
  const [inviteStates, setInviteStates] = useState<
    Record<number, InviteState>
  >({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    refetch();
    setError('');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, refetch]);

  const friends = useMemo(
    () =>
      [...(data?.friends ?? [])].sort(
        (a: Friend, b: Friend) =>
          STATUS_ORDER[a.onlineStatus ?? 'offline'] -
          STATUS_ORDER[b.onlineStatus ?? 'offline']
      ),
    [data?.friends]
  );

  const handleInvite = async (friend: Friend) => {
    const id = Number(friend.friendUserId);
    setError('');
    setInviteStates((prev) => ({ ...prev, [id]: 'sending' }));
    try {
      const response = await sendGameInvite({
        friendUserId: id,
        gameName: gameID,
        authKey
      }).unwrap();
      if (response.error) throw new Error(response.error);
      setInviteStates((prev) => ({ ...prev, [id]: 'sent' }));
    } catch (err) {
      setInviteStates((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const message =
        (err as { data?: { error?: string } })?.data?.error ??
        (err instanceof Error ? err.message : '');
      setError(message || t('FRIENDS_DOCK.INVITE_FAILED'));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={modalStyles.overlay}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className={modalStyles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={modalStyles.header}>
          <h2 id={titleId}>{t('GAME_LOBBY.SEND_INVITE_FRIEND')}</h2>
        </div>
        <div className={`${modalStyles.body} ${styles.body}`}>
          {error && (
            <div className={styles.error}>
              <Notice tone="error" title={error} />
            </div>
          )}
          <div className={styles.list} role="list">
            {isLoading ? (
              <div className={styles.empty}>{t('PROFILE.LOADING_FRIENDS')}</div>
            ) : friends.length === 0 ? (
              <div className={styles.empty}>{t('FRIENDS_DOCK.EMPTY')}</div>
            ) : (
              friends.map((friend: Friend) => {
                const id = Number(friend.friendUserId);
                const name = friend.nickname || friend.username;
                const isOnline = friend.onlineStatus === 'online';
                const isActive = isOnline || friend.onlineStatus === 'playing';
                const state = inviteStates[id];
                return (
                  <div
                    key={id}
                    className={`${styles.row} ${
                      isActive ? '' : styles.rowOffline
                    }`}
                    role="listitem"
                  >
                    <span
                      className={`${styles.dot} ${
                        isActive ? styles.dotOnline : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span className={styles.name}>{name}</span>
                    {isOnline ? (
                      <button
                        type="button"
                        className={styles.inviteButton}
                        onClick={() => handleInvite(friend)}
                        disabled={!!state}
                        aria-label={t('FRIENDS_DOCK.INVITE_LABEL', { name })}
                      >
                        {state === 'sent'
                          ? t('FRIENDS_DOCK.INVITED')
                          : t('FRIENDS_DOCK.INVITE')}
                      </button>
                    ) : (
                      <span className={styles.status}>
                        {t(
                          friend.onlineStatus === 'playing'
                            ? 'PROFILE.FRIEND_PLAYING'
                            : 'PROFILE.FRIEND_OFFLINE'
                        )}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className={modalStyles.footer}>
          <button
            type="button"
            className={modalStyles.buttonCancel}
            onClick={onClose}
            autoFocus
          >
            {t('FRIENDS_DOCK.DONE')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InviteFriendModal;
