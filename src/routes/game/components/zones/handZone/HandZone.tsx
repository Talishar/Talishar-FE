import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector, useAppStore } from 'app/Hooks';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { getCardPreview } from '../../elements/cardPortal/cardPreviewStore';
import { useFannedHand } from '../playerHand/useFannedHand';
import { useShowsLandscapeFan } from '../playerHand/useShowsLandscapeFan';
import {
  FAN_OPPONENT_NAME_ATTR,
  FAN_OPPONENT_HAND_GAP_PX,
  FAN_OPPONENT_HAND_MIN_STEP_PX
} from '../playerHand/fanLayout';

const CARD_GAP = 5; // matches the flex gap in HandZone.module.css
const ZONE_MAX_WIDTH = 0.6; // matches max-width: 60% in HandZone.module.css
const MAX_OVERLAP_RATIO = 0.88; // never hide more than 88% of a card

type HandLayout = { isOverflowing: boolean; overlap: number };
const EMPTY_HAND_LAYOUT: HandLayout = { isOverflowing: false, overlap: 0 };

const HandZone = React.memo(function HandZone(prop: Player) {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const revealedHandCards = useAppSelector((state: RootState) => {
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
  const handCardBack = useAppSelector((state: RootState) => {
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
    return handOwner.CardBack?.cardNumber ?? 'CardBack';
  });
  const extraArsenalCards = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View =
      (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    const handOwner =
      isPlayer === isP2View ? state.game.playerTwo : state.game.playerOne;
    return Math.max(0, (handOwner.Arsenal?.length ?? 0) - 1);
  });
  const handCardBackNumber = handCardBack.toLowerCase();
  const hideHand = useAppSelector(
    (state: RootState) =>
      !isPlayer &&
      state.game.gameInfo.isReplay &&
      !!state.game.replayHideOpponentHand
  );
  const handCards = useMemo(
    () =>
      hideHand
        ? revealedHandCards?.map(() => ({ cardNumber: handCardBack }))
        : revealedHandCards,
    [hideHand, revealedHandCards, handCardBack]
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const store = useAppStore();
  const fannedHand = useFannedHand();

  const [windowWidth, windowHeight] = useWindowDimensions();
  const showsLandscapeFan = useShowsLandscapeFan();
  const isShortScreen = useMediaQuery('(max-height: 500px)');
  const besideArsenal = !isPlayer && showsLandscapeFan && isShortScreen;
  const zoneRef = useRef<HTMLDivElement>(null);
  const lastPointerTypeRef = useRef<string | null>(null);
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
    const nameAnchor = besideArsenal
      ? document.querySelector(`[${FAN_OPPONENT_NAME_ATTR}]`)
      : null;
    const namePlate = nameAnchor?.firstElementChild;
    const fit = () => {
      const firstCard = zone?.querySelector(
        ':scope > div'
      ) as HTMLElement | null;
      const cardWidth =
        (namePlate
          ? firstCard?.getBoundingClientRect().width
          : firstCard?.offsetWidth) ?? 0;
      if (!zone || !cardWidth || cardCount === 0) {
        setLayout((previous) =>
          previous.isOverflowing || previous.overlap !== 0
            ? EMPTY_HAND_LAYOUT
            : previous
        );
        return;
      }
      const naturalWidth = cardCount * (cardWidth + CARD_GAP) - CARD_GAP;
      const availableWidth = namePlate
        ? zone.getBoundingClientRect().right -
          namePlate.getBoundingClientRect().right -
          FAN_OPPONENT_HAND_GAP_PX
        : windowWidth * ZONE_MAX_WIDTH;
      const nextIsOverflowing = naturalWidth > availableWidth;
      let nextOverlap = 0;
      if (cardCount > 1) {
        const idealOverlap =
          (availableWidth - cardWidth) / (cardCount - 1) - cardWidth - CARD_GAP;
        nextOverlap = Math.max(
          Math.min(idealOverlap, 0),
          namePlate
            ? FAN_OPPONENT_HAND_MIN_STEP_PX - cardWidth - CARD_GAP
            : -MAX_OVERLAP_RATIO * cardWidth
        );
      }
      setLayout((previous) =>
        previous.isOverflowing === nextIsOverflowing &&
        previous.overlap === nextOverlap
          ? previous
          : { isOverflowing: nextIsOverflowing, overlap: nextOverlap }
      );
    };
    fit();
    if (!nameAnchor || !namePlate) return;
    const observer = new ResizeObserver(fit);
    observer.observe(nameAnchor);
    observer.observe(namePlate);
    return () => observer.disconnect();
  }, [cardCount, windowWidth, windowHeight, besideArsenal, extraArsenalCards]);

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

  // Empty, but still a fixed card-sized box pinned to the bottom of the
  // viewport, so it must not swallow taps aimed at the board zones under it.
  if (
    handCards === undefined ||
    (isPlayer && (fannedHand || (playerID !== 3 && !isReplay)))
  ) {
    return <div className={classNames(displayRow, styles.emptyZone)}></div>;
  }

  const zoneTitle = isPlayer ? 'Your Hand' : "Opponent's Hand";

  const openHandList = () => {
    if (!canOpenHandList) return;
    // A tap that just opened a card preview is only a preview request.
    if (lastPointerTypeRef.current === 'touch' && getCardPreview().popupOn) {
      return;
    }
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
        {
          '--hand-arsenal-extra': extraArsenalCards,
          ...(compactActive ? { '--hand-overlap': `${overlap}px` } : {})
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        lastPointerTypeRef.current = event.pointerType;
      }}
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
