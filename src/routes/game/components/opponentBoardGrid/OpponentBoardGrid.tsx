import styles from './OpponentBoardGrid.module.css';
import BoardGrid from '../boardGrid/BoardGrid';

interface Props {
  swapPlayers?: boolean;
}

export default function OpponentBoardGrid({ swapPlayers = false }: Props) {
  return <BoardGrid isPlayer={swapPlayers} styles={styles} />;
}
