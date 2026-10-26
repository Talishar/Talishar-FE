import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { MUTE_SOUND } from 'features/options/constants';
import { useCookieString } from 'utils/cookieStore';

export const MUTE_REPLAY_SOUNDS_COOKIE = 'muteReplaySounds';

export default function useIsSoundMuted() {
  const isSoundOff = useAppSelector(
    (state: RootState) => state.settings.entities[MUTE_SOUND]?.value === '1'
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay ?? false
  );
  const muteReplaySounds =
    useCookieString(MUTE_REPLAY_SOUNDS_COOKIE) === 'true';
  return isSoundOff || (isReplay && muteReplaySounds);
}
