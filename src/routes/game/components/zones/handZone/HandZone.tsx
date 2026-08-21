import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';

const CARD_GAP = 5; // matches the flex gap in HandZone.module.css
const ZONE_MAX_WIDTH = 0.6; // matches max-width: 60% in HandZone.module.css
const MAX_OVERLAP_RATIO = 0.88; // never hide more than 88% of a card

const HandZone = React.memo(function HandZone(prop: Player) {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const handCards = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View =
      (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    return isPlayer
      ? isP2View
        ? state.game.playerTwo.Hand
        : state.game.playerOne.Hand
      : isP2View
      ? state.game.playerOne.Hand
      : state.game.playerTwo.Hand;
  });
  const handCardBackNumber = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View =
      (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    const handOwner = isPlayer
      ? isP2View
        ? state.game.playerTwo
        : state.game.playerOne
      : isP2View
      ? state.game.playerOne
      : state.game.playerTwo;
    return handOwner.CardBack?.cardNumber.toLowerCase() ?? 'cardback';
  });
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const zoneRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const cardCount = handCards?.length ?? 0;
  const canOpenHandList =
    cardCount > 0 &&
    (isPlayer ||
      (handCards?.some(
        (card: Card) => card.cardNumber.toLowerCase() !== handCardBackNumber
      ) ??
        false));

  useLayoutEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    let frameId = 0;
    const measure = () => {
      frameId = 0;
      const firstCard = zone.querySelector(
        ':scope > div'
      ) as HTMLElement | null;
      const cardWidth = firstCard?.offsetWidth ?? 0;
      if (!cardWidth || cardCount === 0) {
        zone.style.removeProperty('--hand-overlap');
        setIsOverflowing(false);
        return;
      }

      const naturalWidth = cardCount * (cardWidth + CARD_GAP) - CARD_GAP;
      const availableWidth =
        document.documentElement.clientWidth * ZONE_MAX_WIDTH;
      const overflowing = naturalWidth > availableWidth;
      setIsOverflowing((previous) =>
        previous === overflowing ? previous : overflowing
      );

      if (overflowing && cardCount > 1) {
        const idealOverlap =
          (availableWidth - cardWidth) / (cardCount - 1) - cardWidth - CARD_GAP;
        const overlap = Math.max(
          Math.min(idealOverlap, 0),
          -MAX_OVERLAP_RATIO * cardWidth
        );
        zone.style.setProperty('--hand-overlap', `${overlap}px`);
      } else {
        zone.style.removeProperty('--hand-overlap');
      }
    };
    const scheduleMeasure = () => {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    return () => {
      window.removeEventListener('resize', scheduleMeasure);
      if (frameId !== 0) cancelAnimationFrame(frameId);
    };
  }, [cardCount]);

  // Backend uniqueIds fall back to '-', so duplicates are deduped by a
  // per-cardNumber occurrence counter rather than by position.
  const cardKeys = useMemo(() => {
    const seen = new Map<string, number>();
    return (handCards ?? []).map((card: Card) => {
      if (card.uniqueId && card.uniqueId !== '-') return card.uniqueId;
      const occurrence = seen.get(card.cardNumber) ?? 0;
      seen.set(card.cardNumber, occurrence + 1);
      return `${card.cardNumber}#${occurrence}`;
    });
  }, [handCards]);

  const displayRow = classNames(
    styles.handZone,
    isPlayer ? styles.isPlayer : styles.isOpponent,
    { [styles.clickable]: canOpenHandList }
  );

  if (handCards === undefined || (playerID !== 3 && !isReplay && isPlayer)) {
    return <div className={displayRow}></div>;
  }

  const zoneTitle = isPlayer ? 'Your Hand' : "Opponent's Hand";

  const openHandList = () => {
    if (!canOpenHandList) return;
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      dispatch(clearCardListFocus());
    } else {
      dispatch(setCardListFocus({ cardList: handCards, name: zoneTitle }));
    }
  };

  const compactActive = isOverflowing;

  return (
    <div
      className={classNames(displayRow, { [styles.compact]: compactActive })}
      ref={zoneRef}
      onClick={openHandList}
      title={
        canOpenHandList ? `Click to view ${zoneTitle.toLowerCase()}` : undefined
      }
    >
      {handCards.map((card: Card, index: number) => (
        <CardDisplay card={card} key={cardKeys[index]} isPlayer={isPlayer} />
      ))}
    </div>
  );
});

export default HandZone;
