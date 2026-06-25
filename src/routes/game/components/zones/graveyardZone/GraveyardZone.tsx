import React, { useMemo } from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './GraveyardZone.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const alwaysShowCounters = useAppSelector(
    (state: RootState) =>
      String(state.settings.entities?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1'
  );

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const totalCards = graveyardZone?.length ?? 0;
  const isMobileOrTablet = windowWidth <= 1024;
  const baseOffsetY = totalCards * -0.24;
  const baseOffsetX = totalCards * 0.24;

  const cardToDisplay = useMemo(
    () => (graveyardZone?.[0] ? { ...graveyardZone[0], borderColor: '' } : undefined),
    [graveyardZone]
  );

  const layerStyles = useMemo(() => {
    if (totalCards <= 1) return [];
    return Array.from({ length: totalCards - 1 }, (_, index) => ({
      transform:
        `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) ` +
        `translateY(${(index + 1) * 0.25}px) translateX(${(index + 1) * -0.25}px)`,
      zIndex: totalCards - index - 1
    }));
  }, [totalCards, baseOffsetY, baseOffsetX]);

  const cardWrapperStyle = useMemo(
    () =>
      !isMobileOrTablet
        ? { transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px)` }
        : {},
    [isMobileOrTablet, baseOffsetY, baseOffsetX]
  );

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const graveyardZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Graveyard`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      dispatch(clearCardListFocus());
    } else {
      dispatch(setCardListFocus({ cardList: graveyardZone, name: zoneTitle }));
    }
  };

  // Count only face-up cards (overlay !== 'disabled')
  const faceUpCount = graveyardZone.filter(
    (card) => card.overlay !== 'disabled'
  ).length;

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect - only on desktop */}
        {!isMobileOrTablet &&
          layerStyles.map((style, index) => (
            <div
              key={`layer-${index}`}
              className={styles.zoneLayer}
              style={style}
            />
          ))}
        {/* Main card on top */}
        <div
          className={styles.cardWrapper}
          style={cardWrapperStyle}
        >
          {cardToDisplay && (
            <CardDisplay
              card={cardToDisplay}
              isPlayer={isPlayer}
              num={faceUpCount}
              preventUseOnClick
              showCountersOnHover={!alwaysShowCounters}
              disableTilt
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default GraveyardZone;
