import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdPeople } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import {
  useDeclineGameInviteMutation,
  useGetFriendsListQuery,
  useGetGameInvitesQuery
} from 'features/api/apiSlice';
import { Friend, FriendOnlineStatus } from 'interface/API/FriendListAPI.php';
import { GameInvite } from 'interface/API/GameInviteAPI.php';
import { useOutsideClick } from 'hooks/useOutsideClick';
import styles from './FriendsDock.module.css';

const OPEN_REFRESH_MS = 60_000;
const CLOSED_REFRESH_MS = 180_000;
const INVITE_REFRESH_MS = 10_000;

const INVITE_FORMAT_KEYS: Record<string, string> = {
  cc: 'CC',
  compcc: 'COMPETITIVE_CC',
  blitz: 'BLITZ',
  compblitz: 'COMPETITIVE_BLITZ',
  llcc: 'LL',
  compllcc: 'COMPETITIVE_LL',
  sage: 'SAGE',
  compsage: 'COMPETITIVE_SAGE',
  futuresage: 'FUTURE_SAGE',
  futurecc: 'FUTURE_CC',
  gage: 'GAGE'
};

const inviteKey = (invite: GameInvite) =>
  `${invite.fromUserId}:${invite.gameName}`;

const STATUS_ORDER: Record<FriendOnlineStatus, number> = {
  playing: 0,
  online: 1,
  offline: 2
};

const isActive = (friend: Friend) =>
  friend.onlineStatus === 'online' || friend.onlineStatus === 'playing';

const FriendsDock = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetFriendsListQuery(undefined);
  const hasFriends = (data?.friends?.length ?? 0) > 0;
  const { data: inviteData, refetch: refetchInvites } = useGetGameInvitesQuery(
    undefined,
    { skip: !hasFriends }
  );
  const [declineGameInvite] = useDeclineGameInviteMutation();
  const [dismissedInvites, setDismissedInvites] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (!hasFriends) return;
    const id = window.setInterval(() => {
      if (!document.hidden) refetchInvites();
    }, INVITE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [hasFriends, refetchInvites]);

  useEffect(() => {
    const id = window.setInterval(
      () => {
        if (!document.hidden) refetch();
      },
      isOpen ? OPEN_REFRESH_MS : CLOSED_REFRESH_MS
    );
    return () => window.clearInterval(id);
  }, [isOpen, refetch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  useOutsideClick(dockRef, () => setIsOpen(false), { enabled: isOpen });

  const friends = useMemo(
    () =>
      [...(data?.friends ?? [])].sort(
        (a: Friend, b: Friend) =>
          STATUS_ORDER[a.onlineStatus ?? 'offline'] -
          STATUS_ORDER[b.onlineStatus ?? 'offline']
      ),
    [data?.friends]
  );
  const onlineCount = friends.filter(isActive).length;

  const friendNames = useMemo(() => {
    const names = new Map<number, string>();
    for (const friend of data?.friends ?? []) {
      names.set(
        Number(friend.friendUserId),
        friend.nickname || friend.username
      );
    }
    return names;
  }, [data?.friends]);

  const invites = (inviteData?.invites ?? []).filter(
    (invite) => !dismissedInvites.has(inviteKey(invite))
  );

  const dismissInvite = (invite: GameInvite) =>
    setDismissedInvites((prev) => new Set(prev).add(inviteKey(invite)));

  const handleInviteFriend = (friend: Friend) => {
    setIsOpen(false);
    navigate(
      `/game/create?visibility=private&invite=${friend.friendUserId}`
    );
  };

  const handleJoinInvite = (invite: GameInvite) => {
    dismissInvite(invite);
    navigate(`/game/join/${invite.gameName}`);
  };

  const handleDeclineInvite = (invite: GameInvite) => {
    dismissInvite(invite);
    declineGameInvite({
      fromUserId: invite.fromUserId,
      gameName: invite.gameName
    });
  };

  const handleToggle = () => {
    if (!isOpen) refetch();
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dock} ref={dockRef}>
      {isOpen && (
        <div
          className={styles.panel}
          role="dialog"
          aria-labelledby="friends-dock-title"
        >
          <div className={styles.header}>
            <span id="friends-dock-title" className={styles.title}>
              {t('FRIENDS_DOCK.TITLE')}
            </span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={t('FRIENDS_DOCK.CLOSE')}
            >
              <IoMdClose aria-hidden="true" />
            </button>
          </div>
          <div className={styles.list} role="list">
            {isLoading ? (
              <div className={styles.empty}>{t('PROFILE.LOADING_FRIENDS')}</div>
            ) : friends.length === 0 ? (
              <div className={styles.empty}>{t('FRIENDS_DOCK.EMPTY')}</div>
            ) : (
              friends.map((friend: Friend) => (
                <div
                  key={friend.friendUserId}
                  className={`${styles.row} ${
                    isActive(friend) ? '' : styles.rowOffline
                  }`}
                  role="listitem"
                >
                  <span
                    className={`${styles.dot} ${
                      isActive(friend) ? styles.dotOnline : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span className={styles.name}>
                    {friend.nickname || friend.username}
                  </span>
                  {friend.onlineStatus === 'online' ? (
                    <button
                      type="button"
                      className={styles.inviteButton}
                      onClick={() => handleInviteFriend(friend)}
                      aria-label={t('FRIENDS_DOCK.INVITE_LABEL', {
                        name: friend.nickname || friend.username
                      })}
                    >
                      {t('FRIENDS_DOCK.INVITE')}
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
              ))
            )}
          </div>
          <div className={styles.footer}>
            <Link
              to="/user/profile"
              className={styles.manageLink}
              onClick={() => setIsOpen(false)}
            >
              {t('FRIENDS_DOCK.MANAGE')}
            </Link>
          </div>
        </div>
      )}
      {invites.map((invite) => {
        const formatKey = INVITE_FORMAT_KEYS[invite.format];
        return (
          <div
            key={inviteKey(invite)}
            className={styles.inviteCard}
            role="status"
          >
            <div className={styles.inviteText}>
              <span className={styles.inviteTitle}>
                {t('FRIENDS_DOCK.INVITED_YOU', {
                  name: friendNames.get(invite.fromUserId) || invite.fromName
                })}
              </span>
              {formatKey && (
                <span className={styles.inviteFormat}>
                  {t(`GAME_LIST.FORMATS.${formatKey}`)}
                </span>
              )}
            </div>
            <div className={styles.inviteActions}>
              <button
                type="button"
                className={styles.inviteDecline}
                onClick={() => handleDeclineInvite(invite)}
              >
                {t('FRIENDS_DOCK.DECLINE')}
              </button>
              <button
                type="button"
                className={styles.inviteJoin}
                onClick={() => handleJoinInvite(invite)}
              >
                {t('FRIENDS_DOCK.JOIN')}
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={t('FRIENDS_DOCK.OPEN', { count: onlineCount })}
      >
        <MdPeople className={styles.toggleIcon} aria-hidden="true" />
        <span className={styles.toggleLabel}>{t('FRIENDS_DOCK.TITLE')}</span>
        {onlineCount > 0 && (
          <span className={styles.count} aria-hidden="true">
            <span className={styles.countValue}>{onlineCount}</span>
          </span>
        )}
      </button>
    </div>
  );
};

export default FriendsDock;
