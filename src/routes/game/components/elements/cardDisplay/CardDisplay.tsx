import { useAppDispatch } from 'app/Hooks';
import { Card } from 'features/Card';
import { playCard } from 'features/game/GameSlice';
import styles from './CardDisplay.module.css';
import classNames from 'classnames';
import CountersOverlay from '../countersOverlay/CountersOverlay';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import CombatChainLink from 'features/CombatChainLink';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import React, { useState, useCallback, useMemo } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

const subCardProps = new Map<string, Card>();
const getSubCardProp = (cardNumber: string): Card => {
  const cached = subCardProps.get(cardNumber);
  if (cached !== undefined) return cached;
  const created: Card = { cardNumber };
  subCardProps.set(cardNumber, created);
  return created;
};

const BORDER_CLASSES: readonly (string | undefined)[] = [
  undefined,
  styles.border1,
  styles.border2,
  styles.border3,
  styles.border4,
  styles.border5,
  styles.border6,
  styles.border7,
  styles.border8,
  styles.border9,
  styles.border10
];

const borderClassFor = (borderColor: string | undefined): string | undefined =>
  borderColor === undefined ? undefined : BORDER_CLASSES[Number(borderColor)];

const NUM_USES_MARKERS: React.ReactNode[][] = [];
const numUsesMarkers = (numUses: number): React.ReactNode[] => {
  const cached = NUM_USES_MARKERS[numUses];
  if (cached !== undefined) return cached;
  const divs: React.ReactNode[] = [];
  for (let i = 1; i <= numUses; i++) {
    divs.push(<div className={styles.numUsesCircle} key={i} />);
  }
  NUM_USES_MARKERS[numUses] = divs;
  return divs;
};

const SUB_CARD_STYLES: React.CSSProperties[] = [];
const subCardStyle = (ix: number): React.CSSProperties => {
  const cached = SUB_CARD_STYLES[ix];
  if (cached !== undefined) return cached;
  const created: React.CSSProperties = {
    top: `calc(-0.15 * ${ix + 1} * var(--card-size))`,
    zIndex: `-${ix + 1}`,
    animationDelay: `${ix * 40}ms`
  };
  SUB_CARD_STYLES[ix] = created;
  return created;
};

const EMPTY_SUBCARDS: string[] = [];

const TARGETED_TRIM_RE = /^\/|\/$|^\s*\/\s*/g;

export interface CardProp {
  makeMeBigger?: boolean;
  num?: number;
  name?: string;
  preventUseOnClick?: boolean;
  useCardMode?: number;
  card?: Card;
  activeCombatChain?: CombatChainLink;
  isPlayer?: boolean;
  isShuffling?: boolean;
  showCountersOnHover?: boolean;
  disableTilt?: boolean;
  children?: React.ReactNode;
}

export const CardDisplay = (prop: CardProp) => {
  const {
    card,
    preventUseOnClick,
    activeCombatChain,
    num,
    isPlayer,
    isShuffling,
    showCountersOnHover,
    disableTilt,
    children
  } = prop;
  const dispatch = useAppDispatch();
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const viewerID = playerID === 2 ? 2 : 1;
  const isOpponentCard =
    card?.isOpponent !== undefined
      ? card.isOpponent
      : isPlayer !== undefined
      ? !isPlayer
      : card?.controller
      ? card.controller !== viewerID
      : false;
  const cardBack = useAppSelector((state: RootState) =>
    !isOpponentCard
      ? state.game.playerOne.CardBack
      : state.game.playerTwo.CardBack
  ) ?? { cardNumber: '' };
  const { getLanguage } = useLanguageSelector();
  const [showSubCards, setShowSubCards] = useState(false);
  const handleHoverStart = useCallback(() => setShowSubCards(true), []);
  const handleHoverEnd = useCallback(() => setShowSubCards(false), []);
  const subCardsToShow = useMemo(() => {
    const subcards = card?.subcards;
    if (!subcards || subcards.length === 0) return EMPTY_SUBCARDS;

    if (showSubCards) return subcards.filter((subCard) => !!subCard);
    for (const subcard of subcards) {
      if (subcard) return [subcard];
    }
    return EMPTY_SUBCARDS;
  }, [card?.subcards, showSubCards]);

  if (card == null || card.cardNumber === '') {
    return null;
  }

  const locale = getLanguage();
  const cardNumber =
    card.facing === 'DOWN' ? cardBack.cardNumber : card.cardNumber;

  const imageSrc = getCollectionCardImagePath({
    path: CARD_SQUARES_PATH,
    locale,
    cardNumber
  });

  function onClick() {
    if (preventUseOnClick) {
      return;
    }
    if (card === undefined) {
      return;
    }
    dispatch(playCard({ cardParams: card }));
  }

  const isDisabled = card.overlay === 'disabled' || Number(card.overlay) === 1;

  const isTargeted = card.label?.includes('Targeted') ?? false;

  const hasEquipStatus =
    card.isBroken ||
    card.onChain ||
    card.isFrozen ||
    card.marked ||
    card.holoCounters ||
    !!card.restriction ||
    isTargeted;

  const cardStyle = classNames(styles.card, styles.normalSize, {
    [styles.biggerSize]: prop.makeMeBigger,
    [styles.showCountersOnHover]: showCountersOnHover,
    [styles.playable]: card.borderColor == '6'
  });

  const countersLabel = isTargeted
    ? card.label?.replace('Targeted', '').replace(TARGETED_TRIM_RE, '').trim()
    : card.label;

  return (
    <CardPopUp
      cardNumber={card.cardNumber}
      containerClass={cardStyle}
      onClick={onClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      isOpponent={isOpponentCard}
      disableTilt={disableTilt}
    >
      {subCardsToShow.map((subCardNumber, ix) => {
        if (
          !subCardNumber ||
          typeof subCardNumber !== 'string' ||
          subCardNumber.trim() === ''
        )
          return null;
        const subCardKey = `subcard-${card.cardNumber}-${subCardNumber}-${ix}`;

        return (
          <div
            key={subCardKey}
            style={subCardStyle(ix)}
            className={styles.subCard}
          >
            <CardDisplay
              card={getSubCardProp(subCardNumber)}
              preventUseOnClick
              isPlayer={!isOpponentCard}
            />
          </div>
        );
      })}

      <CardImage
        src={imageSrc}
        alt={card?.cardName ?? prop.name ?? ''}
        className={classNames(styles.img, borderClassFor(card.borderColor), {
          [styles.tapped]: card.tapped
        })}
        isShuffling={isShuffling}
        isOpponent={isOpponentCard}
      />
      {isDisabled && (
        <div className={classNames(styles.floatTint, styles.disabled)} />
      )}
      {hasEquipStatus && (
        <div
          className={classNames(styles.floatTint, {
            [styles.isBroken]: card.isBroken,
            [styles.onChain]: card.onChain,
            [styles.isFrozen]: card.isFrozen,
            [styles.holoCounters]: card.holoCounters,
            [styles.marked]: card.marked,
            [styles.tapped]: card.tapped,
            [styles.isRestricted]: !!card.restriction,
            [styles.isTargeted]: isTargeted
          })}
        />
      )}
      {card.numUses && card.numUses > 1 && card.numUses < 10 && (
        <div className={styles.numUses}>{numUsesMarkers(card.numUses)}</div>
      )}
      <CountersOverlay
        countersMap={card.countersMap}
        gem={card.gem}
        actionDataOverride={card.actionDataOverride}
        zone={card.zone}
        controller={card.controller}
        restriction={card.restriction}
        label={countersLabel}
        num={num}
        activeCombatChain={activeCombatChain}
      />
      {children}
    </CardPopUp>
  );
};

// Memoized: game-state updates keep references stable for unchanged cards
// (see utils/PreserveIdentities), so cards that didn't change skip re-render
// even when another card in the same zone did.
export default React.memo(CardDisplay);
