import React, { useRef } from 'react';
import { useEffect } from 'react';
import { RootState } from 'app/Store';
import {
  clearGetLobbyRefresh,
  gameLobby,
  getGameInfo,
  setGameStart,
  setIsUpdateInProgressFalse
} from 'features/game/GameSlice';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GameLocationState } from 'interface/GameLocationState';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { toast } from 'react-hot-toast';

interface LobbyUpdateHandlerProps {
  isSubmitting: boolean;
}

export const LobbyUpdateHandler = React.memo(
  ({ isSubmitting }: LobbyUpdateHandlerProps) => {
    const abortRef = useRef<AbortController>();
    const gameInfo = useAppSelector(getGameInfo, shallowEqual);
    const isUpdateInProgress = useAppSelector(
      (state: RootState) => state.game.isUpdateInProgress
    );
    const lastUpdate = useAppSelector(
      (state: RootState) => state.game.gameDynamicInfo.lastUpdate
    );
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { gameID } = useParams();
    const location = useLocation();
    const locationState = location.state as GameLocationState | undefined;
    const [{ gameName = '0', playerID = '3', authKey = '' }] =
      useKnownSearchParams();

    if (gameID === undefined) {
      navigate('/');
      toast.error('No GameID defined');
    }

    // setup long poll
    useEffect(() => {
      if (isUpdateInProgress) {
        return;
      }
      dispatch(
        gameLobby({
          game: gameInfo,
          signal: abortRef.current?.signal,
          lastUpdate: lastUpdate ?? 0
        })
      );

      // timeout if longer than 10 seconds. Will clear this interval on next poll
      const timeOut = setTimeout(() => {
        //console.log('timed out');
        abortRef.current?.abort;
        dispatch(setIsUpdateInProgressFalse());
      }, 10000);

      return () => {
        //console.log('timeout cleared');
        clearTimeout(timeOut);
      };
    }, [gameInfo.gameID, isUpdateInProgress, dispatch]);

    if (isSubmitting) {
      abortRef.current?.abort();
    }

    // gameID already in params
    useEffect(() => {
      abortRef.current = new AbortController();

      return () => {
        abortRef.current?.abort();
        dispatch(setIsUpdateInProgressFalse());
        dispatch(clearGetLobbyRefresh());
      };
    }, [isSubmitting]);

    useEffect(() => {
      dispatch(
        setGameStart({
          gameID: parseInt(gameID ?? ''),
          playerID: locationState?.playerID ?? parseInt(playerID),
          authKey: locationState?.authKey ?? authKey
        })
      );
    }, []);

    return null;
  }
);

LobbyUpdateHandler.displayName = 'LobbyUpdateHandler';
export default LobbyUpdateHandler;
