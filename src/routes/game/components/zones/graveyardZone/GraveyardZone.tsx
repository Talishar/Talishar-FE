import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './GraveyardZone.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import * as optConst from 'features/options/constants';

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const settingsData = useAppSelector((state: RootState) => state.settings.entities);
  const alwaysShowCounters = String(settingsData?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1';

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  const cardListFocus = useAppSelector((state: RootState) => state.game.cardListFocus);

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const showCount = true;

  const graveyardZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Graveyard`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      // Close it
      dispatch(clearCardListFocus());
    } else {
      // Open it
      dispatch(
        setCardListFocus({
          cardList: graveyardZone,
          name: zoneTitle
        })
      );
    }
  };

  const cardToDisplay = { ...graveyardZone[0], borderColor: '' };

  // Count only face-up cards (overlay !== 'disabled')
  const faceUpCount = graveyardZone.filter(card => card.overlay !== 'disabled').length;
  const totalCards = graveyardZone.length;
  const layerOffsetY = 0.25; // pixels per layer (down)
  const layerOffsetX = -0.25; // pixels per layer (left)
  const baseOffsetY = totalCards * 0.24 * -1; // pixels (up, based on card count)
  const baseOffsetX = totalCards * 0.24; // pixels (right, based on card count)

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect */}
        {Array.from({ length: totalCards - 1 }).map((_, index) => (
          <div
            key={`layer-${index}`}
            className={styles.zoneLayer}
            style={{
              transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) translateY(${(index + 1) * layerOffsetY}px) translateX(${(index + 1) * layerOffsetX}px)`,
              zIndex: totalCards - index - 1
            }}
          />
        ))}
        {/* Main card on top */}
        <div className={styles.cardWrapper} style={{ transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px)` }}>
          <CardDisplay
            card={cardToDisplay}
            isPlayer={isPlayer}
            num={showCount ? faceUpCount : undefined}
            preventUseOnClick
            showCountersOnHover={!alwaysShowCounters}
          />
        </div>
      </div>
    </div>
  );
});

export default GraveyardZone;
