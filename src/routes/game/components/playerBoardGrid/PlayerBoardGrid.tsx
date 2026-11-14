import styles from './PlayerBoardGrid.module.css';
import BoardGrid from '../boardGrid/BoardGrid';
import Effects, { PHONE_PORTRAIT_QUERY } from '../elements/effects/Effects';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useAppSelector } from 'app/Hooks';
import classNames from 'classnames';
import { selectHasZoneCounts } from '../zones/zoneCountsZone/ZoneCounts';
import { useShowsPortraitFan } from '../zones/playerHand/useShowsPortraitFan';

interface Props {
  swapPlayers?: boolean;
}

export default function PlayerBoardGrid({ swapPlayers = false }: Props) {
  const isPhonePortrait = useMediaQuery(PHONE_PORTRAIT_QUERY);
  const showsPortraitFan = useShowsPortraitFan();
  const hasCounts = useAppSelector((state) =>
    selectHasZoneCounts(state, !swapPlayers)
  );
  return (
    <BoardGrid
      isPlayer={!swapPlayers}
      styles={styles}
      inGrid={
        showsPortraitFan && (
          <>
            <div
              className={classNames(styles.boardEffects, {
                [styles.boardEffectsBesideArrow]: hasCounts
              })}
            >
              <Effects isPlayer inBoard />
            </div>
            <div
              className={classNames(styles.arrowCell, {
                [styles.arrowCellBeside]: hasCounts
              })}
              data-fan-portrait-arrow=""
            />
          </>
        )
      }
    >
      {isPhonePortrait && !showsPortraitFan && (
        <Effects isPlayer underEquipment />
      )}
    </BoardGrid>
  );
}
