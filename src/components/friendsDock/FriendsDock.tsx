import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdPeople } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { useGetFriendsListQuery } from 'features/api/apiSlice';
import { Friend, FriendOnlineStatus } from 'interface/API/FriendListAPI.php';
import { useOutsideClick } from 'hooks/useOutsideClick';
import styles from './FriendsDock.module.css';

const OPEN_REFRESH_MS = 60_000;
const CLOSED_REFRESH_MS = 180_000;

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
  const { data, isLoading, refetch } = useGetFriendsListQuery(undefined);

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
                  <span className={styles.status}>
                    {t(
                      friend.onlineStatus === 'playing'
                        ? 'PROFILE.FRIEND_PLAYING'
                        : friend.onlineStatus === 'online'
                        ? 'PROFILE.FRIEND_ONLINE'
                        : 'PROFILE.FRIEND_OFFLINE'
                    )}
                  </span>
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
            {onlineCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FriendsDock;
