import styles from './PlayerBoardGrid.module.css';
import BoardGrid from '../boardGrid/BoardGrid';

interface Props {
  swapPlayers?: boolean;
}

export default function PlayerBoardGrid({ swapPlayers = false }: Props) {
  return <BoardGrid isPlayer={!swapPlayers} styles={styles} />;
}
