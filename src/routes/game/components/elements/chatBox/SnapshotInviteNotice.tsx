import { useMemo } from 'react';
import classNames from 'classnames';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './ChatBox.module.css';

const readSession = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export default function SnapshotInviteNotice({
  mobile = false
}: {
  mobile?: boolean;
}) {
  const { t } = useTranslation();
  const gameID = useAppSelector(
    (state: RootState) => state.game.gameInfo.gameID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay ?? false
  );
  const { inviteUrl, messageKey } = useMemo(
    () => ({
      inviteUrl: readSession(`talishar_snapshot_invite_${gameID}`),
      messageKey:
        readSession(`talishar_snapshot_invite_notice_${gameID}`) ??
        'LOAD_REPLAY.SNAPSHOT_INVITE_COPIED'
    }),
    [gameID]
  );

  if (!inviteUrl || isReplay) return null;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success(t('LOAD_REPLAY.SNAPSHOT_INVITE_COPIED'));
    } catch {
      window.prompt(t('LOAD_REPLAY.SNAPSHOT_COPY_INVITE'), inviteUrl);
    }
  };

  return (
    <div
      className={classNames(
        mobile ? styles.chatMobileMessage : styles.chatMessage,
        styles.snapshotInviteNotice
      )}
    >
      {t(messageKey)}{' '}
      <button
        type="button"
        className={styles.snapshotInviteCopy}
        onClick={copyInvite}
      >
        {t('OPTIONS_MENU.COPY_SNAPSHOT_INVITE')}
      </button>
    </div>
  );
}
