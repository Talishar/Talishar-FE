import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { MANUAL_MODE } from 'features/options/constants';
import useSetting from './useSetting';

const FUTURES_FORMATS = ['futurecc', 'futurell', 'futuresage'];

export function useCanUseManualMode() {
  const isOpponentAI = useAppSelector(
    (state: RootState) => state.game.gameInfo.isOpponentAI ?? false
  );
  const isPrivate = useAppSelector(
    (state: RootState) =>
      (state.game.gameInfo.isPrivate ?? false) ||
      (state.game.gameInfo.isPrivateLobby ?? false)
  );
  const isPracticeDummy = useAppSelector(
    (state: RootState) => state.game.playerTwo?.Name === 'Practice Dummy'
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay ?? false
  );
  const isFuturesFormat = useAppSelector((state: RootState) =>
    FUTURES_FORMATS.includes(state.game.gameInfo.gameFormat ?? '')
  );
  const isLocalEnvironment =
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost';

  if (isReplay) return false;
  return (
    isLocalEnvironment ||
    isOpponentAI ||
    isPracticeDummy ||
    isPrivate ||
    isFuturesFormat
  );
}

/**
 * The manual mode setting is stored per user, so it carries over into games
 * that do not allow it. Always read it through here so it stays off there.
 */
export default function useManualMode() {
  const canUseManualMode = useCanUseManualMode();
  const settingEnabled =
    useSetting({ settingName: MANUAL_MODE })?.value === '1';
  return {
    canUseManualMode,
    isManualMode: canUseManualMode && settingEnabled
  };
}
