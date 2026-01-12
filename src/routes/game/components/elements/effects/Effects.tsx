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
  isPlayer?: boolean;
}

export function Effect(prop: CardProp) {
  const { card, imgClassName, isPlayer } = prop;
  const src = generateCroppedImageUrl(prop.card.cardNumber);
  // Get the number value - check counters first, then use num from card if available
  const numValue = card.counters ?? (card as any).num ?? 0;
  const imgBorderClass = isPlayer ? styles.imgPlayerBorder : styles.imgOpponentBorder;
  return (
    <CardPopUp cardNumber={prop.card.cardNumber} containerClass={styles.effect}>
      <div className={styles.overlayContainer}>
        <img src={src} className={`${styles.img} ${imgBorderClass} ${imgClassName || ''}`} />
        <CountersOverlay {...card} num={numValue} excludeFancyCounters={true} />
      </div>
    </CardPopUp>
  );
}

export default function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const spectatorCameraView = useAppSelector((state: RootState) => state.game.spectatorCameraView);

  // Get both effects
  const playerOneEffects = useAppSelector((state: RootState) => state.game.playerOne.Effects);
  const playerTwoEffects = useAppSelector((state: RootState) => state.game.playerTwo.Effects);

  let effects;
  if (playerID === 3) {
    if (spectatorCameraView === 2) {
      effects = props.isPlayer ? playerTwoEffects : playerOneEffects;
    } else {
      effects = props.isPlayer ? playerOneEffects : playerTwoEffects;
    }
  } else {
    effects = props.isPlayer ? playerOneEffects : playerTwoEffects;
  }

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index) => {
        return <Effect card={card} key={index} isPlayer={props.isPlayer} />;
      })}
    </div>
  );
}
