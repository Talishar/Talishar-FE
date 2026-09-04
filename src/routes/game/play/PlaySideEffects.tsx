import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { getGameInfo, setHeroInfo } from 'features/game/GameSlice';
import { settingsUpdated } from 'features/options/optionsSlice';
import {
  AUTO_PASS_TURN,
  SHORTCUT_ATTACK_THRESHOLD,
  SKIP_AR_WINDOW,
  SKIP_DR_WINDOW
} from 'features/options/constants';
import { useReplayPlayback } from './ReplayPlaybackContext';

export const TurnChangeSettingsSync = () => {
  const dispatch = useAppDispatch();
  const turnNo = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo?.turnNo
  );
  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );
  const prevTurnNoRef = useRef<number | undefined>(undefined);
  const prevTurnPlayerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevTurnNoRef.current === undefined) {
      prevTurnNoRef.current = turnNo;
      prevTurnPlayerRef.current = turnPlayer;
      return;
    }
    if (
      turnNo !== prevTurnNoRef.current ||
      turnPlayer !== prevTurnPlayerRef.current
    ) {
      prevTurnNoRef.current = turnNo;
      prevTurnPlayerRef.current = turnPlayer;
      // These local shortcuts reset atomically at the same turn boundary.
      // Keep this centralized instead of relying on an individual control to
      // be mounted, otherwise the UI can display stale auto-pass state.
      dispatch(
        settingsUpdated([
          { name: SHORTCUT_ATTACK_THRESHOLD, value: '0' },
          { name: SKIP_AR_WINDOW, value: '0' },
          { name: SKIP_DR_WINDOW, value: '0' },
          { name: AUTO_PASS_TURN, value: '0' }
        ])
      );
    }
  }, [turnNo, turnPlayer, dispatch]);

  return null;
};

export const HeroInfoSync = () => {
  const dispatch = useAppDispatch();
  const playerOneHeroCardNumber = useAppSelector(
    (state: RootState) => state.game.playerOne?.Hero?.cardNumber
  );
  const playerTwoHeroCardNumber = useAppSelector(
    (state: RootState) => state.game.playerTwo?.Hero?.cardNumber
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  useEffect(() => {
    const playerID = gameInfo?.playerID;

    if (playerID && playerOneHeroCardNumber && playerTwoHeroCardNumber) {
      if (!gameInfo?.opponentHeroCardNumber) {
        const yourCardNumber =
          playerID === 1 ? playerOneHeroCardNumber : playerTwoHeroCardNumber;
        const opponentCardNumber =
          playerID === 1 ? playerTwoHeroCardNumber : playerOneHeroCardNumber;

        dispatch(
          setHeroInfo({
            heroName: gameInfo?.heroName,
            yourHeroCardNumber: yourCardNumber,
            opponentHeroCardNumber: opponentCardNumber
          })
        );
      }
    }
  }, [
    playerOneHeroCardNumber,
    playerTwoHeroCardNumber,
    gameInfo?.playerID,
    gameInfo?.opponentHeroCardNumber,
    gameInfo?.heroName,
    dispatch
  ]);

  return null;
};

export const CardScaleVariables = () => {
  const [cookies] = useCookies([
    'cardSize',
    'transparencyIntensity',
    'hoverImageSize'
  ]);

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--card-scale', cookies.cardSize || '1');
    root.setProperty(
      '--transparency-intensity',
      cookies.transparencyIntensity || '1'
    );
    root.setProperty('--hover-img-scale', cookies.hoverImageSize || '1');
  }, [cookies.cardSize, cookies.transparencyIntensity, cookies.hoverImageSize]);

  return null;
};

export const ReplayAdvanceButton = () => {
  const { t } = useTranslation();
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const { activateReplayControl, isPlaying, useSpaceToAdvanceOneStep } =
    useReplayPlayback();

  if (!isReplay || canPassPhase !== true) return null;

  return (
    <button
      type="button"
      className={`replayAdvanceButton ${
        isPlaying ? 'replayAdvanceButtonPlaying' : ''
      }`}
      onClick={activateReplayControl}
    >
      {useSpaceToAdvanceOneStep
        ? t('PLAY.ADVANCE_REPLAY')
        : isPlaying
        ? t('PASS_TURN_DISPLAY.PAUSE')
        : t('PASS_TURN_DISPLAY.PLAY')}
    </button>
  );
};
