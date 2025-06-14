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
import { useState, useRef } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

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
}

export const CardDisplay = (prop: CardProp) => {
  const { card, preventUseOnClick, activeCombatChain, num, isPlayer, isShuffling } = prop;
  const dispatch = useAppDispatch();
  const cardBack = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.CardBack : state.game.playerTwo.CardBack
  ) ?? { cardNumber: '' };
  const { getLanguage } = useLanguageSelector();
  const [showSubCards, setShowSubCards] = useState(true);  const subCardRef = useRef(null);

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

  const classStyles = classNames(styles.floatTint, {
    [styles.disabled]: card.overlay === 'disabled'
  });

  const equipStatus = classNames(
    styles.floatTint,
    { [styles.isBroken]: card.isBroken },
    { [styles.onChain]: card.onChain },
    { [styles.isFrozen]: card.isFrozen },
    { [styles.marked]: card.marked },
    { [styles.tapped]: card.tapped },
    { [styles.isRestricted]: !!card.restriction }
  );

  const imgStyles = classNames(styles.img, {
    [styles.border1]: card.borderColor == '1',
    [styles.border2]: card.borderColor == '2',
    [styles.border3]: card.borderColor == '3',
    [styles.border4]: card.borderColor == '4',
    [styles.border5]: card.borderColor == '5',
    [styles.border6]: card.borderColor == '6',
    [styles.border7]: card.borderColor == '7',
    [styles.border8]: card.borderColor == '8'
  });

  const cardStyle = classNames(styles.card, styles.normalSize, {
    [styles.biggerSize]: prop.makeMeBigger
  });

  const renderNumUses = (numUses: number) => {
    let divs = [];
    for (let i = 1; i <= numUses; i++) {
      divs.push(<div className={styles.numUsesCircle} key={i}></div>);
    }
    return divs;
  };

  const subCardsToShow = (() => {
    if (!card.subcards || card.subcards.length === 0) return [];
    const validSubcards = card.subcards.filter(subCard => !!subCard);
    return showSubCards ? validSubcards : validSubcards.length ? [validSubcards[0]] : [];
  })();

  return (
    <CardPopUp
      cardNumber={card.cardNumber}
      containerClass={cardStyle}
      onClick={onClick}
      onHoverStart={() => setShowSubCards(true)}
      onHoverEnd={() => setShowSubCards(false)}
    >
      {subCardsToShow.map((subCardNumber, ix) => {
        if (!subCardNumber || typeof subCardNumber !== 'string' || subCardNumber.trim() === '') return null;
        const subCardKey = `subcard-${card.cardNumber}-${subCardNumber}-${ix}`;

        return (
            <div
              ref={subCardRef}
              style={{
                top: `calc(-0.15 * ${ix + 1} * var(--card-size))`,
                zIndex: `-${ix + 1}`,
              }}
              className={styles.subCard}
            >
              <CardDisplay card={{ cardNumber: subCardNumber }} preventUseOnClick />
            </div>
        );
      })}

      <CardImage
        src={imageSrc}
        className={classNames(imgStyles, { [styles.tapped]: card.tapped })}
        isShuffling={isShuffling}
      />
      {card.overlay === 'disabled' && <div className={classStyles}></div>}
      {(card.isBroken ||
        card.onChain ||
        card.isFrozen ||
        card.marked ||
        !!card.restriction) && <div className={equipStatus}></div>}
      {card.numUses && card.numUses > 1 && card.numUses < 10 && (
        <div className={styles.numUses}>{renderNumUses(card.numUses)}</div>
      )}
      <CountersOverlay
        {...card}
        num={num}
        activeCombatChain={activeCombatChain}
      />
    </CardPopUp>
  );
};

export default CardDisplay;
