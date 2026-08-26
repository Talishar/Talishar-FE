import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { PROCESS_INPUT } from 'appConstants';
import { submitButton } from 'features/game/GameSlice';
import { RootState } from 'app/Store';

const REPLAY_STEP_INTERVAL_MS = 1000;
const REQUEST_POLL_INTERVAL_MS = 100;
export const REPLAY_PLAYBACK_SPEEDS = [
  0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3
] as const;
export type ReplayPlaybackSpeed = (typeof REPLAY_PLAYBACK_SPEEDS)[number];

type ReplayPlaybackContextValue = {
  isPlaying: boolean;
  playbackSpeed: ReplayPlaybackSpeed;
  useSpaceToAdvanceOneStep: boolean;
  activateReplayControl: () => void;
  pausePlayback: () => void;
  stepBackward: () => void;
  stepForward: () => void;
  setPlaybackSpeed: (speed: ReplayPlaybackSpeed) => void;
  setUseSpaceToAdvanceOneStep: (enabled: boolean) => void;
};

const ReplayPlaybackContext = createContext<
  ReplayPlaybackContextValue | undefined
>(undefined);

export function ReplayPlaybackProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const isRequestInProgress = useAppSelector(
    (state: RootState) => state.game.isPlayerInputInProgress ?? false
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] =
    useState<ReplayPlaybackSpeed>(1);
  const [useSpaceToAdvanceOneStep, setUseSpaceToAdvanceOneStepState] =
    useState(false);

  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);
  const isReplayRef = useRef(isReplay);
  const isRequestInProgressRef = useRef(isRequestInProgress);
  const turnPhaseRef = useRef(turnPhase);
  isPlayingRef.current = isPlaying;
  playbackSpeedRef.current = playbackSpeed;
  isReplayRef.current = isReplay;
  isRequestInProgressRef.current = isRequestInProgress;
  turnPhaseRef.current = turnPhase;

  const pausePlayback = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const advanceOneStep = useCallback(async () => {
    if (
      !isReplayRef.current ||
      isRequestInProgressRef.current ||
      turnPhaseRef.current === 'OVER'
    )
      return;

    isRequestInProgressRef.current = true;
    try {
      await dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.PASS } })
      ).unwrap();
    } finally {
      isRequestInProgressRef.current = false;
    }
  }, [dispatch]);

  const stepForward = useCallback(() => {
    if (isPlayingRef.current) return;
    void advanceOneStep().catch(pausePlayback);
  }, [advanceOneStep, pausePlayback]);

  const stepBackward = useCallback(() => {
    if (
      isPlayingRef.current ||
      !isReplayRef.current ||
      isRequestInProgressRef.current
    )
      return;

    isRequestInProgressRef.current = true;
    void dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.REPLAY_STEP_BACK } })
    )
      .unwrap()
      .catch(pausePlayback)
      .finally(() => {
        isRequestInProgressRef.current = false;
      });
  }, [dispatch, pausePlayback]);

  const activateReplayControl = useCallback(() => {
    if (!isReplayRef.current) return;

    if (useSpaceToAdvanceOneStep) {
      void advanceOneStep().catch(pausePlayback);
      return;
    }

    setIsPlaying((playing) => {
      const next = !playing;
      isPlayingRef.current = next;
      return next;
    });
  }, [advanceOneStep, pausePlayback, useSpaceToAdvanceOneStep]);

  const setUseSpaceToAdvanceOneStep = useCallback(
    (enabled: boolean) => {
      setUseSpaceToAdvanceOneStepState(enabled);
      if (enabled) pausePlayback();
    },
    [pausePlayback]
  );

  const setPlaybackSpeed = useCallback((speed: ReplayPlaybackSpeed) => {
    playbackSpeedRef.current = speed;
    setPlaybackSpeedState(speed);
  }, []);

  useEffect(() => {
    if (!isReplay || turnPhase === 'OVER') pausePlayback();
  }, [isReplay, pausePlayback, turnPhase]);

  useEffect(() => {
    if (!isPlaying || useSpaceToAdvanceOneStep || !isReplay) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (delay: number) => {
      timer = setTimeout(advanceReplay, delay);
    };

    const advanceReplay = async () => {
      if (cancelled || !isPlayingRef.current) return;
      if (!isReplayRef.current || turnPhaseRef.current === 'OVER') {
        pausePlayback();
        return;
      }
      if (isRequestInProgressRef.current) {
        schedule(REQUEST_POLL_INTERVAL_MS);
        return;
      }

      try {
        await advanceOneStep();
        if (!cancelled)
          schedule(REPLAY_STEP_INTERVAL_MS / playbackSpeedRef.current);
      } catch {
        if (!cancelled) pausePlayback();
      }
    };

    schedule(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    advanceOneStep,
    isPlaying,
    isReplay,
    pausePlayback,
    useSpaceToAdvanceOneStep
  ]);

  const value = useMemo(
    () => ({
      isPlaying,
      playbackSpeed,
      useSpaceToAdvanceOneStep,
      activateReplayControl,
      pausePlayback,
      stepBackward,
      stepForward,
      setPlaybackSpeed,
      setUseSpaceToAdvanceOneStep
    }),
    [
      activateReplayControl,
      isPlaying,
      playbackSpeed,
      pausePlayback,
      stepBackward,
      stepForward,
      setPlaybackSpeed,
      setUseSpaceToAdvanceOneStep,
      useSpaceToAdvanceOneStep
    ]
  );

  return (
    <ReplayPlaybackContext.Provider value={value}>
      {children}
    </ReplayPlaybackContext.Provider>
  );
}

export function useReplayPlayback() {
  const context = useContext(ReplayPlaybackContext);
  if (!context) {
    throw new Error(
      'useReplayPlayback must be used inside ReplayPlaybackProvider'
    );
  }
  return context;
}
