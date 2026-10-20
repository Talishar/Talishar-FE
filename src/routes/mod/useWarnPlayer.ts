import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSendSystemMessageToPlayerMutation } from 'features/api/apiSlice';

const WARNING_EXPIRY_HOURS = 168;

export default function useWarnPlayer() {
  const { t } = useTranslation();
  const [sendToPlayer, { isLoading: isWarning }] =
    useSendSystemMessageToPlayerMutation();

  const warn = async (username: string) => {
    const message = window.prompt(
      t('BLOCK_REPORTS.WARN_PROMPT', { username }),
      t('BLOCK_REPORTS.WARN_DEFAULT_MESSAGE')
    );
    if (!message || !message.trim()) return;
    try {
      await sendToPlayer({
        username,
        message: message.trim(),
        expiresInHours: WARNING_EXPIRY_HOURS
      }).unwrap();
      toast.success(t('BLOCK_REPORTS.WARN_SENT', { username }));
    } catch (err: any) {
      toast.error(err?.data?.error || t('BLOCK_REPORTS.WARN_FAILED'));
    }
  };

  return { warn, isWarning };
}
