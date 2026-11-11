import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { selectSidePlayer } from 'features/game/perspective';
import { hitPreviewDelta } from 'features/game/hitPreview';
import { hitPreviewBadge } from '../hitPreview/HitPreview';
import styles from './HealthDisplay.module.css';

export default function HealthDisplay(props: Player) {
  const isPlayer = props.isPlayer;
  const health = useAppSelector(
    (state: RootState) => selectSidePlayer(state, isPlayer).Health
  );
  const healthDelta = useAppSelector((state: RootState) =>
    hitPreviewDelta(
      selectSidePlayer(state, isPlayer),
      (player) => player.Health
    )
  );

  return (
    <div className={styles.health}>
      <div className={styles.tick}>{health}</div>
      {hitPreviewBadge(healthDelta)}
    </div>
  );
}
