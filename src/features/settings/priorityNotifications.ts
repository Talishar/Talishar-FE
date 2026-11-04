export const PRIORITY_NOTIFICATIONS_COOKIE = 'priorityNotifications';

export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const hasNotificationPermission = () =>
  notificationsSupported() && Notification.permission === 'granted';

export const requestNotificationPermission = async () => {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
};
