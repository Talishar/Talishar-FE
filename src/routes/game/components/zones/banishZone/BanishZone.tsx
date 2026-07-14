import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './BanishZone.module.css';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';

const MAX_STACK_LAYERS = 12;

export const BanishZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const alwaysShowCounters = useAppSelector(
    (state: RootState) =>
      String(state.settings.entities?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1'
  );

  const banishZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const totalCards = banishZone?.length ?? 0;
  const isMobileOrTablet = windowWidth <= 1024;
  const baseOffsetY = totalCards * -0.24;
  const baseOffsetX = totalCards * 0.24;

  const cardToDisplay = useMemo(
    () => banishZone?.[0] ? { ...banishZone[0], borderColor: '' } : undefined,
    [banishZone]
  );

  const layerStyles = useMemo(() => {
    if (totalCards <= 1) return [];
    const layerCount = Math.min(MAX_STACK_LAYERS, totalCards - 1);
    return Array.from({ length: layerCount }, (_, index) => {
      const sourceIndex =
        layerCount === 1
          ? 0
          : Math.round((index * (totalCards - 2)) / (layerCount - 1));

      return {
        transform:
          `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) ` +
          `translateY(${(sourceIndex + 1) * 0.25}px) translateX(${(sourceIndex + 1) * -0.25}px)`,
        zIndex: totalCards - sourceIndex - 1
      };
    });
  }, [totalCards, baseOffsetY, baseOffsetX]);

  const cardWrapperStyle = useMemo(
    () =>
      !isMobileOrTablet
        ? {
            transform: `translate3d(${Math.round(baseOffsetX)}px, ${Math.round(baseOffsetY)}px, 0)`
          }
        : undefined,
    [isMobileOrTablet, baseOffsetY, baseOffsetX]
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

  let faceUpCount = 0;
  for (const card of banishZone) {
    if (card.overlay !== 'disabled') ++faceUpCount;
  }

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
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

export default BanishZone;
