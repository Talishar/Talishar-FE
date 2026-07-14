import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './Effects.module.css';
import { Card } from 'features/Card';
import { useAppSelector } from 'app/Hooks';
import CardPopUp from '../cardPopUp/CardPopUp';
import CardImage from '../cardImage/CardImage';
import { generateCroppedImageUrl } from 'utils/cropImages';
import CountersOverlay from '../countersOverlay/CountersOverlay';

export interface CardProp {
  card: Card;
  num?: number;
  name?: string;
  imgClassName?: string;
  isPlayer?: boolean;
}

export function Effect(prop: CardProp) {
  const { card, imgClassName, isPlayer } = prop;
  const src = generateCroppedImageUrl(prop.card.cardNumber);
  // Get the number value - check counters first, then use num from card if available
  const numValue = card.counters ?? (card as any).num ?? 0;
  const imgBorderClass = isPlayer
    ? styles.imgPlayerBorder
    : styles.imgOpponentBorder;
  return (
    <CardPopUp cardNumber={prop.card.cardNumber} containerClass={styles.effect} isOpponent={!isPlayer}>
      <div className={styles.overlayContainer}>
        <CardImage
          src={src}
          className={`${styles.img} ${imgBorderClass} ${imgClassName || ''}`}
          isOpponent={!isPlayer}
        />
        <CountersOverlay {...card} num={numValue} excludeFancyCounters={true} />
      </div>
    </CardPopUp>
  );
}

export default function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;

  const isPlayer = props.isPlayer;
  const effects = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View =
      (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    return isPlayer
      ? (isP2View ? state.game.playerTwo.Effects : state.game.playerOne.Effects)
      : (isP2View ? state.game.playerOne.Effects : state.game.playerTwo.Effects);
  });

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index: number) => {
        return <Effect card={card} key={index} isPlayer={props.isPlayer} />;
      })}
    </div>
  );
}
