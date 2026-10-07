import styles from './PlayerBoardGrid.module.css';
import BoardGrid from '../boardGrid/BoardGrid';
import Effects, { PHONE_PORTRAIT_QUERY } from '../elements/effects/Effects';
import { useMediaQuery } from 'hooks/useMediaQuery';

interface Props {
  swapPlayers?: boolean;
}

export default function PlayerBoardGrid({ swapPlayers = false }: Props) {
  const isPhonePortrait = useMediaQuery(PHONE_PORTRAIT_QUERY);
  return (
    <BoardGrid isPlayer={!swapPlayers} styles={styles}>
      {isPhonePortrait && <Effects isPlayer underEquipment />}
    </BoardGrid>
  );
}
