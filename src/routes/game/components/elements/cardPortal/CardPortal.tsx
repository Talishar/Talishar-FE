import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardImage from '../cardImage/CardImage';
import styles from './CardPortal.module.css';
import { doubleFacedCardsMappings } from './constants';
import classNames from 'classnames';
import useWindowDimensions from 'hooks/useWindowDimensions';

const popUpGap = 10;

function CardDetails({ src, containerClass, containerStyle }: { src: string, containerClass?: string, containerStyle?: Record<string, string> }) {
  const containerClassName = containerClass != null ? containerClass : classNames(styles.defaultPos, styles.popUp);
  return (
    <div className={containerClassName} style={containerStyle}>
        <div className={styles.popUpInside} key={src}>
          <CardImage src={src} className={styles.img} />
        </div>
    </div>);
}

function getSrcs(cardNumber: string): Array<string> {
  const cardNumbers = [cardNumber];
  if (doubleFacedCardsMappings[cardNumber] != null) {
    cardNumbers.push(doubleFacedCardsMappings[cardNumber]);
  }
  return cardNumbers.map((currentCardNumber) => 
    `/cardimages/${currentCardNumber}.webp`
  );
}

export default function CardPortal() {
  const popup = useAppSelector((state: RootState) => state.game.popup);
  const [windowWidth, windowHeight] = useWindowDimensions();
  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const [src, dfcSrc] = getSrcs(popup.popupCard.cardNumber);

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return (<CardDetails src={src} />);
  }

  const popUpStyle: Record<string, string> = {};

  if (popup.xCoord > windowWidth / 2) {
    popUpStyle.right =
      (windowWidth - (popup.xCoord - popUpGap)).toString() + 'px';
  } else {
    popUpStyle.left = (popup.xCoord + popUpGap).toString() + 'px';
  }

  if (popup.yCoord < windowHeight / 2) {
    popUpStyle.top = popup.yCoord.toString() + 'px';
  } else {
    popUpStyle.bottom =
      (windowHeight - popup.yCoord + popUpGap).toString() + 'px';
  }

  return (
    <div className={styles.popUpContainer} style={popUpStyle}>
      {dfcSrc != null && <CardDetails src={dfcSrc} containerClass={classNames(styles.popUp, styles.doubleFacedCard)} />}
      <CardDetails src={src} containerClass={styles.popUp} containerStyle={popUpStyle} />
    </div>
   )
}
