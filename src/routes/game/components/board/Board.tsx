import CombatChain from '../combatChain/CombatChain';
import styles from './Board.module.css';
import PlayerPrompt from '../elements/playerPrompt/PlayerPrompt';
import PlayerBoardGrid from '../playerBoardGrid/PlayerBoardGrid';
import OpponentBoardGrid from '../opponentBoardGrid/OpponentBoardGrid';
import GridBoard from './../gridBoard';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieString } from 'utils/cookieStore';
import ExperimentalTurnWidget from '../elements/experimentalTurnWidget';
import TurnWidget from '../elements/turnWidget/TurnWidget';
import ManualModePanel from '../leftColumn/ManualModePanel/ManualModePanel';
import { useAppSelector } from 'app/Hooks';
import { getGameInfo } from 'features/game/GameSlice';
import { RootState } from 'app/Store';
import AmbientParticles from '../elements/ambientParticles';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  const useOldScreen = useMediaQuery('(orientation: portrait)');
  const experimental = useCookieString('experimental');
  const { playerID, isReplay } = useAppSelector(getGameInfo);
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );

  const isSpectatorViewingPlayer2 =
    (playerID === 3 || isReplay) && spectatorCameraView === 2;

  if (useOldScreen) {
    return (
      <div className={styles.gameBoard}>
        <AmbientParticles />
        <ManualModePanel />
        <OpponentBoardGrid swapPlayers={isSpectatorViewingPlayer2} />
        <div className={styles.chainMiddleContainer}>
          <div className={styles.chainContainer}>
            <CombatChain />
          </div>
          <div className={styles.healthContainer}>
            {experimental ? <ExperimentalTurnWidget /> : <TurnWidget />}
          </div>
        </div>
        <div className={styles.playerPromptSlot}>
          <PlayerPrompt />
        </div>
        <PlayerBoardGrid swapPlayers={isSpectatorViewingPlayer2} />
      </div>
    );
  }
  return <GridBoard />;
}
