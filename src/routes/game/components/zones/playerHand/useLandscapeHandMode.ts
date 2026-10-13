import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { FAN_KEEP_OPEN_ATTR } from './fanLayout';

const HAND_PROMPT_PHASES = new Set(['P', 'PAYGOLDORPITCH', 'ARS', 'B']);
const HAND_PAY_PHASES = new Set(['P', 'CHOOSEHANDCANCEL', 'PAYGOLDORPITCH']);

const isHandPromptPhase = (phase: string | undefined) =>
  !!phase &&
  (HAND_PROMPT_PHASES.has(phase) ||
    (phase.includes('CHOOSEHAND') && !phase.includes('MULTI')));

export function useLandscapeHandMode(
  enabled: boolean,
  stageRef: RefObject<HTMLElement>
) {
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );
  const turnNo = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo?.turnNo
  );
  const hasPriority = useAppSelector(
    (state: RootState) => !!state.game.hasPriority
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const [isHandDocked, setIsHandDocked] = useState(true);
  const dockedRef = useRef(true);
  const autoOpenedRef = useRef(false);
  const turnKeyRef = useRef<string | null>(null);
  const promptRef = useRef(false);

  const setDocked = useCallback((docked: boolean) => {
    dockedRef.current = docked;
    setIsHandDocked(docked);
  }, []);

  const isPrompt = hasPriority && isHandPromptPhase(turnPhase);
  const isPayPrompt = isPrompt && HAND_PAY_PHASES.has(turnPhase ?? '');
  const turnKey = turnPlayer === undefined ? null : `${turnNo}-${turnPlayer}`;
  const isMyTurn = Number(turnPlayer) === Number(playerID);

  useLayoutEffect(() => {
    if (turnKey === null) return;
    const turnChanged = turnKey !== turnKeyRef.current;
    const promptStarted = isPrompt && !promptRef.current;
    const promptEnded = !isPrompt && promptRef.current;
    turnKeyRef.current = turnKey;
    promptRef.current = isPrompt;
    let docked = dockedRef.current;
    if (turnChanged) {
      autoOpenedRef.current = false;
      docked = isMyTurn;
    }
    if (promptStarted && docked) {
      autoOpenedRef.current = !isPayPrompt;
      docked = false;
    } else if (promptEnded && autoOpenedRef.current) {
      autoOpenedRef.current = false;
      docked = true;
    }
    if (docked !== dockedRef.current) setDocked(docked);
  }, [turnKey, isPrompt, isPayPrompt, isMyTurn, setDocked]);

  useEffect(() => {
    if (!enabled || isHandDocked) return;
    const shrinkOnOutsideTap = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target === document.body || target === document.documentElement) {
        return;
      }
      if (stageRef.current?.contains(target)) return;
      if (target.closest(`button, [role="button"], [${FAN_KEEP_OPEN_ATTR}]`)) {
        return;
      }
      autoOpenedRef.current = false;
      setDocked(true);
    };
    window.addEventListener('click', shrinkOnOutsideTap, true);
    return () => window.removeEventListener('click', shrinkOnOutsideTap, true);
  }, [enabled, isHandDocked, stageRef, setDocked]);

  const openHand = useCallback(() => {
    autoOpenedRef.current = false;
    setDocked(false);
  }, [setDocked]);

  return { isHandDocked, openHand };
}
