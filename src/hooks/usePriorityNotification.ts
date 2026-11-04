import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  hasNotificationPermission,
  PRIORITY_NOTIFICATIONS_COOKIE
} from 'features/settings/priorityNotifications';
import { useCookieString } from 'utils/cookieStore';

const NOTIFICATION_TAG = 'talishar-priority';

const isAway = () =>
  document.visibilityState === 'hidden' || !document.hasFocus();

export default function usePriorityNotification() {
  const { t } = useTranslation();
  const enabled = useCookieString(PRIORITY_NOTIFICATIONS_COOKIE) === 'true';
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay ?? false
  );
  const notificationRef = useRef<Notification | null>(null);
  const hadPriorityRef = useRef(false);

  useEffect(() => {
    const gained = Boolean(hasPriority) && !hadPriorityRef.current;
    hadPriorityRef.current = Boolean(hasPriority);
    if (!hasPriority) {
      notificationRef.current?.close();
      notificationRef.current = null;
      return;
    }
    if (
      !gained ||
      !enabled ||
      playerID === 3 ||
      isReplay ||
      !isAway() ||
      !hasNotificationPermission()
    )
      return;
    try {
      const notification = new Notification(
        t('SETTINGS.PRIORITY_NOTIFICATION_TITLE'),
        {
          body: t('SETTINGS.PRIORITY_NOTIFICATION_BODY'),
          icon: '/logo254.png',
          tag: NOTIFICATION_TAG
        }
      );
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      notificationRef.current = notification;
    } catch {
      // Android Chrome only allows notifications from a service worker.
    }
  }, [hasPriority, enabled, playerID, isReplay, t]);

  useEffect(() => {
    const closeOnReturn = () => {
      if (isAway()) return;
      notificationRef.current?.close();
      notificationRef.current = null;
    };
    document.addEventListener('visibilitychange', closeOnReturn);
    window.addEventListener('focus', closeOnReturn);
    return () => {
      document.removeEventListener('visibilitychange', closeOnReturn);
      window.removeEventListener('focus', closeOnReturn);
      notificationRef.current?.close();
    };
  }, []);
}
