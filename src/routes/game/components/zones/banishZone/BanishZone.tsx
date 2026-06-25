import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './BanishZone.module.css';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';

export const BanishZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const settingsData = useAppSelector(
    (state: RootState) => state.settings.entities
  );
  const alwaysShowCounters =
    String(settingsData?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1';
  const showCount = true;

  const banishZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const cardToDisplay = useMemo(
    () => banishZone?.[0] ? { ...banishZone[0], borderColor: '' } : undefined,
    [banishZone]
  );

  if (banishZone === undefined || banishZone.length === 0) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const banishZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Banish Zone`;

    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      dispatch(clearCardListFocus());
    } else {
      dispatch(setCardListFocus({ cardList: banishZone, name: zoneTitle }));
    }
  };

  // Count only face-up cards (overlay !== 'disabled')
  const faceUpCount = banishZone.filter(
    (card) => card.overlay !== 'disabled'
  ).length;
  const isMobileOrTablet = windowWidth <= 1024;
  const totalCards = banishZone.length;
  const layerOffsetY = 0.25;
  const layerOffsetX = -0.25;
  const baseOffsetY = totalCards * 0.24 * -1;
  const baseOffsetX = totalCards * 0.24;

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect - only on desktop */}
        {!isMobileOrTablet &&
          Array.from({ length: totalCards - 1 }).map((_, index) => (
            <div
              key={`layer-${index}`}
              className={styles.zoneLayer}
              style={{
                transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) translateY(${
                  (index + 1) * layerOffsetY
                }px) translateX(${(index + 1) * layerOffsetX}px)`,
                zIndex: totalCards - index - 1
              }}
            />
          ))}
        {/* Main card on top */}
        <div
          className={styles.cardWrapper}
          style={
            !isMobileOrTablet
              ? { transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px)` }
              : undefined
          }
        >
          {cardToDisplay && (
            <CardDisplay
              card={cardToDisplay}
              isPlayer={isPlayer}
              num={showCount ? faceUpCount : undefined}
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

export default BanishZone;
