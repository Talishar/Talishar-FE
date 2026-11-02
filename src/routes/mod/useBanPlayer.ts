import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useBanPlayerByNameMutation } from 'features/api/apiSlice';

export default function useBanPlayer() {
  const { t } = useTranslation();
  const [banByName, { isLoading: isBanning }] = useBanPlayerByNameMutation();

  const ban = async (username: string) => {
    const confirmed = window.confirm(
      t('BLOCK_REPORTS.BAN_CONFIRM', { username })
    );
    if (!confirmed) return;
    try {
      const result = await banByName({ playerToBan: username }).unwrap();
      if (result?.status === 'error') throw { data: { error: result.message } };
      toast.success(
        result?.message || t('BLOCK_REPORTS.BANNED_TOAST', { username })
      );
    } catch (err: any) {
      toast.error(err?.data?.error || t('BLOCK_REPORTS.BAN_FAILED'));
    }
  };

  return { ban, isBanning };
}
