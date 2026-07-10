import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  setCardListFocus,
  clearCardListFocus
} from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';

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
      ? (isP2View ? state.game.playerTwo.Hand : state.game.playerOne.Hand)
      : (isP2View ? state.game.playerOne.Hand : state.game.playerTwo.Hand);
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

  const [windowWidth] = useWindowDimensions();
  const zoneRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overlap, setOverlap] = useState(0);
  const cardCount = handCards?.length ?? 0;

  useEffect(() => {
    const zone = zoneRef.current;
    const firstCard = zone?.querySelector(':scope > div') as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? 0;
    if (!zone || !cardWidth || cardCount === 0) {
      setIsOverflowing(false);
      setOverlap(0);
      return;
    }
    const naturalWidth = cardCount * (cardWidth + CARD_GAP) - CARD_GAP;
    const availableWidth = windowWidth * ZONE_MAX_WIDTH;
    setIsOverflowing(naturalWidth > availableWidth);
    if (cardCount > 1) {
      const idealOverlap =
        (availableWidth - cardWidth) / (cardCount - 1) - cardWidth - CARD_GAP;
      setOverlap(
        Math.max(Math.min(idealOverlap, 0), -MAX_OVERLAP_RATIO * cardWidth)
      );
    } else {
      setOverlap(0);
    }
  }, [cardCount, windowWidth]);

  const displayRow = classNames(
    styles.handZone,
    isPlayer ? styles.isPlayer : styles.isOpponent,
    { [styles.clickable]: cardCount > 0 }
  );

  if (handCards === undefined || (playerID !== 3 && !isReplay && isPlayer)) {
    return <div className={displayRow}></div>;
  }

  const zoneTitle = isPlayer ? 'Your Hand' : "Opponent's Hand";

  const openHandList = () => {
    if (cardCount === 0) return;
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
      title={cardCount > 0 ? `Click to view ${zoneTitle.toLowerCase()}` : undefined}
    >
      {handCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} isPlayer={isPlayer} />;
      })}
    </div>
  );
});

export default HandZone;
