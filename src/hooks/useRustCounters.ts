import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { useGetUserProfileQuery } from 'features/api/apiSlice';

export const MAX_RUST_COUNTERS = 3;

const RUST_COUNTER_VIEWERS = ['Dineshjp'];

export const RUST_PANEL_ATTENTION_EVENT = 'talishar:rustPanelAttention';

export const requestRustPanelAttention = () => {
  window.dispatchEvent(new CustomEvent(RUST_PANEL_ATTENTION_EVENT));
};

const useRustCounters = () => {
  const { isLoggedIn, isMod, currentUserName } = useAuth();
  const { isSupporter, isLoading: isSupporterLoading } = useSupporterStatus();
  const canViewRustCounters =
    isMod || RUST_COUNTER_VIEWERS.includes(currentUserName ?? '');
  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: !isLoggedIn || !canViewRustCounters
  });
  const rustCounters = Math.max(0, userProfileData?.rustCounters ?? 0);
  const isRustLocked =
    canViewRustCounters &&
    !isSupporterLoading &&
    !isSupporter &&
    rustCounters >= MAX_RUST_COUNTERS;

  return { canViewRustCounters, rustCounters, isSupporter, isRustLocked };
};

export default useRustCounters;
