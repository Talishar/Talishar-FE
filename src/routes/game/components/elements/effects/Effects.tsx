import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './Effects.module.css';
import { Card } from 'features/Card';
import { useAppSelector } from 'app/Hooks';
import CardPopUp from '../cardPopUp/CardPopUp';
import CardImage from '../cardImage/CardImage';
import { generateCroppedImageUrl } from 'utils/cropImages';
import CountersOverlay from '../countersOverlay/CountersOverlay';
import { selectSidePlayer } from 'features/game/perspective';
import classNames from 'classnames';
import { effectKeys, useEffectArrival } from './effectArrivalStore';

export const PHONE_PORTRAIT_QUERY =
  '(orientation: portrait) and (max-width: 600px)';

export interface CardProp {
  card: Card;
  num?: number;
  name?: string;
  imgClassName?: string;
  isPlayer?: boolean;
  arrivalKey?: string;
}

export function Effect(prop: CardProp) {
  const { card, imgClassName, isPlayer, arrivalKey } = prop;
  const arrival = useEffectArrival(
    isPlayer ? 'player' : 'opponent',
    arrivalKey
  );
  const src = generateCroppedImageUrl(prop.card.cardNumber);
  // Get the number value - check counters first, then use num from card if available
  const numValue = card.counters ?? (card as any).num ?? 0;
  const imgBorderClass = isPlayer
    ? styles.imgPlayerBorder
    : styles.imgOpponentBorder;
  return (
    <CardPopUp
      cardNumber={prop.card.cardNumber}
      containerClass={styles.effect}
      isOpponent={!isPlayer}
      disableTilt
    >
      <div
        className={classNames(styles.overlayContainer, {
          [styles.arriving]: arrival === 'arriving'
        })}
        data-effect-key={arrivalKey}
      >
        <CardImage
          src={src}
          alt={card.cardName ?? prop.name ?? ''}
          className={`${styles.img} ${imgBorderClass} ${imgClassName || ''}`}
          isOpponent={!isPlayer}
        />
        <CountersOverlay {...card} num={numValue} excludeFancyCounters={true} />
      </div>
    </CardPopUp>
  );
}

export default function Effects(
  props: Player & { underEquipment?: boolean; inBoard?: boolean }
) {
  const classCSS = props.inBoard
    ? classNames(styles.inBoard, { [styles.inBoardOpponent]: !props.isPlayer })
    : props.underEquipment
    ? styles.underEquipment
    : props.isPlayer
    ? styles.isPlayer
    : styles.isOpponent;

  const isPlayer = props.isPlayer;
  const effects = useAppSelector(
    (state: RootState) => selectSidePlayer(state, isPlayer).Effects
  );

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  const keys = effectKeys(effects);
  return (
    <div
      className={classCSS}
      data-effects-side={isPlayer ? 'player' : 'opponent'}
    >
      {effects.map((card: Card, i) => (
        <Effect
          card={card}
          key={keys[i]}
          arrivalKey={keys[i]}
          isPlayer={props.isPlayer}
        />
      ))}
    </div>
  );
}
