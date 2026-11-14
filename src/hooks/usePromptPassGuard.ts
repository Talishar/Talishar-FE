import { useCallback, useEffect, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

const PROMPT_PASS_GUARD_MS = 750;

const PRIORITY_PHASES = new Set([
  'M',
  'A',
  'D',
  'B',
  'P',
  'INSTANT',
  'ARS',
  'PDECK',
  'ENDPHASE',
  'STARTTURN',
  'OVER',
  'CHOOSEFIRSTPLAYER'
]);

export default function usePromptPassGuard() {
  const turnPhase = useAppSelector((state: RootState) => state.game.turnPhase);
  const playerInputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );
  const phase = turnPhase?.turnPhase;
  const isPrompt = phase !== undefined && !PRIORITY_PHASES.has(phase);
  const promptOpenedAtRef = useRef(0);

  useEffect(() => {
    if (isPrompt) promptOpenedAtRef.current = performance.now();
  }, [isPrompt, turnPhase, playerInputPopUp]);

  return useCallback(
    () =>
      isPrompt &&
      performance.now() - promptOpenedAtRef.current < PROMPT_PASS_GUARD_MS,
    [isPrompt]
  );
}
