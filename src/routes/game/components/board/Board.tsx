import React from 'react';
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
import { selectIsP2View } from 'features/game/perspective';
import AmbientParticles from '../elements/ambientParticles';

export interface playAreaDimensions {
  dimension: number;
}

export const Board = React.memo(function Board() {
  const useOldScreen = useMediaQuery('(orientation: portrait)');
  const experimental = useCookieString('experimental');
  const isSpectatorViewingPlayer2 = useAppSelector(selectIsP2View);

  if (useOldScreen) {
    return (
      <div className={styles.gameBoard} data-fan-portrait-board="">
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
});
