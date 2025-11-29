import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './Effects.module.css';
import { Card } from 'features/Card';
import { useAppSelector } from 'app/Hooks';
import CardPopUp from '../cardPopUp/CardPopUp';
import { generateCroppedImageUrl } from 'utils/cropImages';
import CountersOverlay from '../countersOverlay/CountersOverlay';

export interface CardProp {
  card: Card;
  num?: number;
  name?: string;
  imgClassName?: string;
}

export function Effect(prop: CardProp) {
  const { card, imgClassName } = prop;
  const src = generateCroppedImageUrl(prop.card.cardNumber);
  // Get the number value - check counters first, then use num from card if available
  const numValue = card.counters ?? (card as any).num ?? 0;
  return (
    <CardPopUp cardNumber={prop.card.cardNumber} containerClass={styles.effect}>
      <div className={styles.overlayContainer}>
        <img src={src} className={`${styles.img} ${imgClassName || ''}`} />
        <CountersOverlay {...card} num={numValue} excludeFancyCounters={true} />
      </div>
    </CardPopUp>
  );
}

export default function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  const effects = useAppSelector((state: RootState) =>
    props.isPlayer ? state.game.playerOne.Effects : state.game.playerTwo.Effects
  );

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index) => {
        return <Effect card={card} key={index} />;
      })}
    </div>
  );
}
