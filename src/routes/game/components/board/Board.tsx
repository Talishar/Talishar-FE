import CombatChain from '../combatChain/CombatChain';
import styles from './Board.module.css';
import PlayerPrompt from '../elements/playerPrompt/PlayerPrompt';
import PlayerBoardGrid from '../playerBoardGrid/PlayerBoardGrid';
import OpponentBoardGrid from '../opponentBoardGrid/OpponentBoardGrid';
import GridBoard from './../gridBoard';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { useCookies } from 'react-cookie';
import ExperimentalTurnWidget from '../elements/experimentalTurnWidget';
import TurnWidget from '../elements/turnWidget/TurnWidget';
import ManualModePanel from '../leftColumn/ManualModePanel/ManualModePanel';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  const [width, height] = useWindowDimensions();
  const [cookies] = useCookies(['experimental']);

  const useOldScreen = height > width;
  // const useOldScreen = true;

  if (useOldScreen) {
    return (
      <div className={styles.gameBoard}>
        <ManualModePanel />
        <OpponentBoardGrid />
        <div className={styles.chainMiddleContainer}>
          <div className={styles.chainContainer}>
            <CombatChain />
          </div>
          <div className={styles.healthContainer}>
            {cookies.experimental ? <ExperimentalTurnWidget /> : <TurnWidget />}
          </div>
        </div>
        <PlayerPrompt />
        <PlayerBoardGrid />
      </div>
    );
  }
  return <GridBoard />;
}
