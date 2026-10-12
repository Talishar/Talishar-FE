import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './TurnWidget.module.css';
import classNames from 'classnames';

export default function TurnWidget({
  passOnly = false
}: {
  passOnly?: boolean;
}) {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const widgetClass = classNames(styles.widget, {
    [styles.myTurn]: canPassPhase === true
  });

  return (
    <div className={styles.widgetContainer}>
      <div className={widgetClass}>
        {!passOnly && (
          <div className={styles.apBadge}>
            <ActionPointDisplay isPlayer />
          </div>
        )}
        {!passOnly && <HealthDisplay isPlayer={false} />}
        <PassTurnDisplay />
        {!passOnly && <HealthDisplay isPlayer />}
      </div>
    </div>
  );
}

export function TurnWidgetVitals() {
  return (
    <div className={classNames(styles.widget, styles.vitals)}>
      <HealthDisplay isPlayer={false} />
      <ActionPointDisplay isPlayer />
      <HealthDisplay isPlayer />
    </div>
  );
}
