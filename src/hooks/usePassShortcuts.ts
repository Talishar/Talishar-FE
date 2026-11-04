import {
  DISABLE_MIDDLE_CLICK_PASS_COOKIE,
  DISABLE_SPACE_PASS_COOKIE
} from 'features/settings/passShortcutPreferences';
import { useCookieString } from 'utils/cookieStore';

export default function usePassShortcuts() {
  return {
    spacePasses: useCookieString(DISABLE_SPACE_PASS_COOKIE) !== 'true',
    middleClickPasses:
      useCookieString(DISABLE_MIDDLE_CLICK_PASS_COOKIE) !== 'true'
  };
}
