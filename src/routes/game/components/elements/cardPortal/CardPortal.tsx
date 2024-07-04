import { useAppSelector } from 'app/Hooks';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { RootState } from 'app/Store';
import CardImage from '../cardImage/CardImage';
import styles from './CardPortal.module.css';
import { doubleFacedCardsMappings } from './constants';
import classNames from 'classnames';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';

const popUpGap = 10;

function CardDetails({
  src,
  containerClass,
  containerStyle
}: {
  src: string;
  containerClass?: string;
  containerStyle?: Record<string, string>;
}) {
  const containerClassName =
    containerClass != null
      ? containerClass
      : classNames(styles.defaultPos, styles.popUp);
  return (
    <div className={containerClassName} style={containerStyle}>
      <div className={styles.popUpInside} key={src}>
        <CardImage src={src} className={styles.img} />
      </div>
    </div>
  );
}

function getSrcs({
  locale,
  cardNumber
}: {
  locale: string;
  cardNumber: string;
}): Array<string> {
  const cardNumbers = [cardNumber];
  if (doubleFacedCardsMappings[cardNumber] != null) {
    cardNumbers.push(doubleFacedCardsMappings[cardNumber]);
  }
  return cardNumbers.map((currentCardNumber) =>
    getCollectionCardImagePath({
      path: CARD_IMAGES_PATH,
      locale,
      cardNumber: currentCardNumber
    })
  );
}

export default function CardPortal() {
  const popup = useAppSelector((state: RootState) => state.game.popup);
  const { getLanguage } = useLanguageSelector();
  const [windowWidth, windowHeight] = useWindowDimensions();
  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const [src, dfcSrc] = getSrcs({
    locale: getLanguage(),
    cardNumber: popup.popupCard.cardNumber
  });

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return <CardDetails src={src} />;
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
      {dfcSrc != null && (
        <CardDetails
          src={dfcSrc}
          containerClass={classNames(styles.popUp, styles.doubleFacedCard)}
        />
      )}
      <CardDetails
        src={src}
        containerClass={styles.popUp}
        containerStyle={popUpStyle}
      />
    </div>
  );
}
