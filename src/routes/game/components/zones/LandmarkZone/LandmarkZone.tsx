import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './LandmarkZone.module.css';
import { shallowEqual } from 'react-redux';
import { selectIsHitPreviewing, viewOnlyCard } from 'features/game/hitPreview';

export const LandmarkZone = () => {
  const cardToDisplay = useAppSelector(
    (state: RootState) => state.game.landmark,
    shallowEqual
  );
  const previewing = useAppSelector(selectIsHitPreviewing);

  if (cardToDisplay === undefined) {
    return null;
  }

  return (
    <div className={styles.landmark}>
      <CardDisplay
        card={previewing ? viewOnlyCard(cardToDisplay) : cardToDisplay}
      />
    </div>
  );
};

export default LandmarkZone;
