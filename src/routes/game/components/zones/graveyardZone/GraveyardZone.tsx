import React, { useMemo } from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './GraveyardZone.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { useMediaQuery } from 'hooks/useMediaQuery';
import * as optConst from 'features/options/constants';
import { useTranslation } from 'react-i18next';

const MAX_STACK_LAYERS = 12;

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const alwaysShowCounters = useAppSelector(
    (state: RootState) =>
      String(
        state.settings.entities?.[optConst.ALWAYS_SHOW_COUNTERS]?.value
      ) === '1'
  );

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const totalCards = graveyardZone?.length ?? 0;
  const isMobileOrTablet = useMediaQuery('(max-width: 1024px)');
  const baseOffsetY = totalCards * -0.24;
  const baseOffsetX = totalCards * 0.24;

  const cardToDisplay = useMemo(
    () =>
      graveyardZone?.[0] ? { ...graveyardZone[0], borderColor: '' } : undefined,
    [graveyardZone]
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
          `translateY(${(sourceIndex + 1) * 0.25}px) translateX(${
            (sourceIndex + 1) * -0.25
          }px)`,
        zIndex: totalCards - sourceIndex - 1
      };
    });
  }, [totalCards, baseOffsetY, baseOffsetX]);

  const cardWrapperStyle = useMemo(
    () =>
      !isMobileOrTablet
        ? {
            transform: `translate3d(${Math.round(baseOffsetX)}px, ${Math.round(
              baseOffsetY
            )}px, 0)`
          }
        : {},
    [isMobileOrTablet, baseOffsetY, baseOffsetX]
  );

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>{t('ZONES.GRAVEYARD')}</div>;
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

  // Count only face-up cards (overlay !== 'disabled') without allocating a filtered copy.
  let faceUpCount = 0;
  for (const card of graveyardZone) {
    if (card.overlay !== 'disabled') ++faceUpCount;
  }

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
        <div className={styles.cardWrapper} style={cardWrapperStyle}>
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
