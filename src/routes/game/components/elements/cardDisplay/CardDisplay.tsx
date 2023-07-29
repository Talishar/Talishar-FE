import { useAppDispatch } from 'app/Hooks';
import { Card } from 'features/Card';
import { playCard } from 'features/game/GameSlice';
import styles from './CardDisplay.module.css';
import classNames from 'classnames';
import CountersOverlay from '../countersOverlay/CountersOverlay';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import { ActiveCardCounterOverlay } from '../countersOverlay/components/ActiveChainCounters';
import CombatChainLink from 'features/CombatChainLink';

export interface CardProp {
  makeMeBigger?: boolean;
  num?: number;
  name?: string;
  preventUseOnClick?: boolean;
  useCardMode?: number;
  card?: Card;
  activeCombatChain?: CombatChainLink;
}

export const CardDisplay = (prop: CardProp) => {
  const { card, preventUseOnClick, activeCombatChain, num } = prop;
  const dispatch = useAppDispatch();

  if (card == null || card.cardNumber === '') {
    return null;
  }

  const eqImg = `/cardsquares/${card.cardNumber}.webp`;

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
    { [styles.isFrozen]: card.isFrozen }
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

  return (
    <CardPopUp
      cardNumber={card.cardNumber}
      containerClass={cardStyle}
      onClick={onClick}
    >
      <CardImage src={eqImg} className={imgStyles} />
      {card.overlay === 'disabled' && <div className={classStyles}></div>}
      {(card.isBroken || card.onChain || card.isFrozen) && (
        <div className={equipStatus}></div>
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
