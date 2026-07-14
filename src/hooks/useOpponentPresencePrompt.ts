import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  decorateWaitingPrompt,
  getPresenceMessage
} from 'features/PlayerPresence';

export default function useOpponentPresencePrompt(
  helpText: string | undefined
): string {
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const opponentPresence = useAppSelector(
    (state: RootState) => state.game.opponentPresence
  );
  const opponentIsTyping = useAppSelector(
    (state: RootState) => state.game.opponentIsTyping ?? false
  );

  const baseText = helpText ?? '';
  if (playerID !== 1 && playerID !== 2) return baseText;
  if (hasPriority !== false) return baseText;

  const presenceMessage = opponentPresence
    ? getPresenceMessage(opponentPresence)
    : opponentIsTyping
    ? 'Opponent is typing'
    : null;

  return decorateWaitingPrompt(baseText, presenceMessage);
}
