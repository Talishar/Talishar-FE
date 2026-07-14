import { useEffect, useMemo } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useReportPresenceMutation } from 'features/api/apiSlice';
import {
  PlayerPresence,
  presenceFromCardListName
} from 'features/PlayerPresence';

const PRESENCE_REFRESH_MS = 2500;

export default function usePlayerPresenceReporter() {
  const gameID = useAppSelector(
    (state: RootState) => state.game.gameInfo.gameID
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const chainLinkSummary = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary
  );
  const showModals = useAppSelector(
    (state: RootState) => state.game.showModals
  );
  const [reportPresence] = useReportPresenceMutation();

  const presence = useMemo<PlayerPresence | null>(() => {
    if (!showModals) return null;
    if (chainLinkSummary?.show && chainLinkSummary.view !== 'preview') {
      return { type: 'combat-summary' };
    }
    if (cardList?.active) {
      return presenceFromCardListName(cardList.name);
    }
    return null;
  }, [
    cardList?.active,
    cardList?.name,
    chainLinkSummary?.show,
    chainLinkSummary?.view,
    showModals
  ]);

  useEffect(() => {
    if (!gameID || (playerID !== 1 && playerID !== 2) || isReplay) return;

    const sendPresence = () => {
      reportPresence({ gameID, playerID, presence }).catch(() => undefined);
    };

    sendPresence();
    if (!presence) return;

    const intervalID = window.setInterval(sendPresence, PRESENCE_REFRESH_MS);
    return () => window.clearInterval(intervalID);
  }, [gameID, playerID, isReplay, presence, reportPresence]);
}
