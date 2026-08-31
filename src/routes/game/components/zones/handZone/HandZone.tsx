import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector, useAppStore } from 'app/Hooks';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import { useWindowWidth } from 'hooks/useWindowDimensions';

const CARD_GAP = 5; // matches the flex gap in HandZone.module.css
const ZONE_MAX_WIDTH = 0.6; // matches max-width: 60% in HandZone.module.css
const MAX_OVERLAP_RATIO = 0.88; // never hide more than 88% of a card

type HandLayout = { isOverflowing: boolean; overlap: number };
const EMPTY_HAND_LAYOUT: HandLayout = { isOverflowing: false, overlap: 0 };

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
  const store = useAppStore();

  const windowWidth = useWindowWidth();
  const zoneRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<HandLayout>(EMPTY_HAND_LAYOUT);
  const { isOverflowing, overlap } = layout;
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
    const firstCard = zone?.querySelector(':scope > div') as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? 0;
    if (!zone || !cardWidth || cardCount === 0) {
      setLayout((previous) =>
        previous.isOverflowing || previous.overlap !== 0
          ? EMPTY_HAND_LAYOUT
          : previous
      );
      return;
    }
    const naturalWidth = cardCount * (cardWidth + CARD_GAP) - CARD_GAP;
    const availableWidth = windowWidth * ZONE_MAX_WIDTH;
    const nextIsOverflowing = naturalWidth > availableWidth;
    let nextOverlap = 0;
    if (cardCount > 1) {
      const idealOverlap =
        (availableWidth - cardWidth) / (cardCount - 1) - cardWidth - CARD_GAP;
      nextOverlap = Math.max(
        Math.min(idealOverlap, 0),
        -MAX_OVERLAP_RATIO * cardWidth
      );
    }
    setLayout((previous) =>
      previous.isOverflowing === nextIsOverflowing &&
      previous.overlap === nextOverlap
        ? previous
        : { isOverflowing: nextIsOverflowing, overlap: nextOverlap }
    );
  }, [cardCount, windowWidth]);

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
    const cardListFocus = store.getState().game.cardListFocus;
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
      style={
        compactActive
          ? ({ '--hand-overlap': `${overlap}px` } as React.CSSProperties)
          : undefined
      }
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
