import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import {
  useAlwaysShowCounters,
  useStackedZoneGeometry
} from './useStackedZone';
import { hitPreviewDelta } from 'features/game/hitPreview';
import { hitPreviewGlow } from '../../elements/hitPreview/HitPreview';

interface StackedCardZoneProps {
  isPlayer?: boolean;
  cards: Card[] | undefined;
  emptyLabel: string;
  zoneName: string;
  styles: Record<string, string>;
  zoneClassName: string;
}

export const StackedCardZone = ({
  isPlayer,
  cards,
  emptyLabel,
  zoneName,
  styles,
  zoneClassName
}: StackedCardZoneProps) => {
  const dispatch = useAppDispatch();
  const alwaysShowCounters = useAlwaysShowCounters();

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const pileDelta = useAppSelector((state: RootState) => {
    const player = isPlayer ? state.game.playerOne : state.game.playerTwo;
    const zone = player.Graveyard === cards ? 'Graveyard' : 'Banish';
    return hitPreviewDelta(player, (side) => side[zone]?.length);
  });

  const totalCards = cards?.length ?? 0;
  const { isMobileOrTablet, layerStyles, cardWrapperStyle } =
    useStackedZoneGeometry(totalCards);

  const cardToDisplay = useMemo(
    () => (cards?.[0] ? { ...cards[0], borderColor: '' } : undefined),
    [cards]
  );

  if (cards === undefined || cards.length === 0) {
    return <div className={zoneClassName}>{emptyLabel}</div>;
  }

  const zoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} ${zoneName}`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      dispatch(clearCardListFocus());
    } else {
      dispatch(setCardListFocus({ cardList: cards, name: zoneTitle }));
    }
  };

  // Count only face-up cards (overlay !== 'disabled') without allocating a filtered copy.
  let faceUpCount = 0;
  for (const card of cards) {
    if (card.overlay !== 'disabled') ++faceUpCount;
  }

  return (
    <div className={zoneClassName} onClick={zoneDisplay}>
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
              containerClassName={hitPreviewGlow(
                pileDelta > 0 ? 'gain' : undefined
              )}
              preventUseOnClick
              showCountersOnHover={!alwaysShowCounters}
              disableTilt
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StackedCardZone;
