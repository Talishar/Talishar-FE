import React, { useRef } from 'react';
import { useEffect } from 'react';
import { RootState } from 'app/Store';
import {
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
import {
  loadGameAuthKey,
  loadGamePlayerID
} from 'utils/LocalKeyManagement';
import { toast } from 'react-hot-toast';

interface LobbyUpdateHandlerProps {
  isSubmitting: boolean;
}

export const LobbyUpdateHandler = React.memo(
  ({ isSubmitting: _isSubmitting }: LobbyUpdateHandlerProps) => {
    const abortRef = useRef<AbortController>();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
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
    const [{ gameName = '0', playerID, authKey = '' }] =
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

      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      dispatch(
        gameLobby({
          game: gameInfo,
          signal: controller.signal,
          lastUpdate: lastUpdate ?? 0
        })
      );

      // timeout if longer than 10 seconds. Will clear this interval on next poll
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
        controller.abort();
        dispatch(setIsUpdateInProgressFalse());
      }, 10000);

    }, [gameInfo.gameID, isUpdateInProgress, dispatch]);

    useEffect(() => {
      return () => {
        abortRef.current?.abort();
        if (timeoutRef.current !== undefined) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
        dispatch(setIsUpdateInProgressFalse());
      };
    }, []);

    useEffect(() => {
      const lobbyGameID = parseInt(gameID ?? gameName);

      let lobbyAuthKey = locationState?.authKey || authKey;
      if (!lobbyAuthKey && lobbyGameID > 0) {
        lobbyAuthKey = loadGameAuthKey(lobbyGameID);
      }

      let lobbyPlayerID =
        locationState?.playerID ??
        (playerID !== undefined ? parseInt(playerID) : NaN);
      if (Number.isNaN(lobbyPlayerID)) {
        const storedPlayerID =
          lobbyAuthKey && lobbyGameID > 0 ? loadGamePlayerID(lobbyGameID) : 0;
        lobbyPlayerID =
          storedPlayerID === 1 || storedPlayerID === 2 ? storedPlayerID : 3;
      }

      dispatch(
        setGameStart({
          gameID: lobbyGameID,
          playerID: lobbyPlayerID,
          authKey: lobbyAuthKey
        })
      );
    }, []);

    return null;
  }
);

LobbyUpdateHandler.displayName = 'LobbyUpdateHandler';
export default LobbyUpdateHandler;
