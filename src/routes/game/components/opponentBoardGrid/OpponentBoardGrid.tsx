import styles from './OpponentBoardGrid.module.css';
import BoardGrid from '../boardGrid/BoardGrid';
import Effects from '../elements/effects/Effects';
import { useShowsPortraitFan } from '../zones/playerHand/useShowsPortraitFan';

interface Props {
  swapPlayers?: boolean;
}

export default function OpponentBoardGrid({ swapPlayers = false }: Props) {
  const showsPortraitFan = useShowsPortraitFan();
  return (
    <BoardGrid
      isPlayer={swapPlayers}
      styles={styles}
      inGrid={
        showsPortraitFan && (
          <div className={styles.boardEffects}>
            <Effects isPlayer={false} inBoard />
          </div>
        )
      }
    />
  );
}
