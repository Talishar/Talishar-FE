import useSound from 'use-sound';
import {
  BASE_VOLUME,
  GameSound,
  parseSoundVolume,
  SOUND_DISABLE_COOKIES,
  SOUND_VOLUME_COOKIE
} from 'features/settings/soundPreferences';
import { useCookieString, useCookieValue } from 'utils/cookieStore';
import useIsSoundMuted from './useIsSoundMuted';

/**
 * Returns the play function, whether this sound is switched off (by Game
 * Sounds or by its own toggle), and the loaded Howl.
 */
export default function useGameSound(src: string, sound: GameSound) {
  const volume = parseSoundVolume(useCookieValue(SOUND_VOLUME_COOKIE));
  const isMuted = useIsSoundMuted();
  const isDisabled = useCookieString(SOUND_DISABLE_COOKIES[sound]) === 'true';
  const [play, { sound: howl }] = useSound(src, {
    volume: BASE_VOLUME[sound] * volume
  });
  return [play, isMuted || isDisabled, howl] as const;
}
