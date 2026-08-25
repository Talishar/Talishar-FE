import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { PROCESS_INPUT } from 'appConstants';
import {
  getGameInfo,
  setHeroInfo,
  submitButton
} from 'features/game/GameSlice';
import { settingsUpdated } from 'features/options/optionsSlice';
import {
  SHORTCUT_ATTACK_THRESHOLD,
  SKIP_AR_WINDOW,
  SKIP_DR_WINDOW
} from 'features/options/constants';

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
      // One adapter update avoids three store notification cycles.
      dispatch(
        settingsUpdated([
          { name: SHORTCUT_ATTACK_THRESHOLD, value: '0' },
          { name: SKIP_AR_WINDOW, value: '0' },
          { name: SKIP_DR_WINDOW, value: '0' }
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
  const dispatch = useAppDispatch();
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  if (!isReplay || canPassPhase !== true) return null;

  return (
    <button
      type="button"
      className="replayAdvanceButton"
      onClick={() =>
        dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }))
      }
    >
      {t('PLAY.ADVANCE_REPLAY')}
    </button>
  );
};
