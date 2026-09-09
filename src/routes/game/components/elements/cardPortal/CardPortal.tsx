import { useMemo } from 'react';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import CardImage from '../cardImage/CardImage';
import styles from './CardPortal.module.css';
import { clearCardPreview, useCardPreview } from './cardPreviewStore';
import { doubleFacedCardsMappings } from './constants';
import classNames from 'classnames';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';
import { useCookieString } from 'utils/cookieStore';
import { createPortal } from 'react-dom';
import { isMeldCard } from 'constants/meldCards';
import CardKeywordStrip from './CardKeywordStrip';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

const popUpGap = 130;

function CardDetails({
  src,
  containerClass,
  containerStyle,
  isOpponent,
  isMeld,
  cardNumber,
  showKeywords = true
}: {
  src: string;
  containerClass?: string;
  containerStyle?: Record<string, string>;
  isOpponent?: boolean;
  isMeld?: boolean;
  cardNumber?: string;
  showKeywords?: boolean;
}) {
  const containerClassName = classNames(
    containerClass != null
      ? containerClass
      : classNames(styles.defaultPos, styles.popUp),
    { [styles.meldWrap]: isMeld }
  );
  return (
    <div className={containerClassName} style={containerStyle}>
      <div className={styles.popUpInside}>
        <CardImage
          src={src}
          className={classNames(styles.img, { [styles.meldImg]: isMeld })}
          isOpponent={isOpponent}
          preferEnglishArt
          eager
        />
      </div>
      {showKeywords && <CardKeywordStrip cardNumber={cardNumber} />}
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
  const popup = useCardPreview();
  const { t } = useTranslation();
  const hoverImageSize = Number(useCookieString('hoverImageSize')) || 1;
  const { getLanguage } = useLanguageSelector();
  const [windowWidth, windowHeight] = useWindowDimensions();

  // useMemo must come before any early return (rules of hooks).
  // getSrcs only recomputes when the hovered card changes, not on every mouse-position update.
  const cardNumber = popup?.popupCard?.cardNumber;
  const isMeld = isMeldCard(cardNumber);
  const [src, dfcSrc] = useMemo(
    () =>
      cardNumber
        ? getSrcs({ locale: getLanguage(), cardNumber })
        : (['', undefined] as const),
    [cardNumber, getLanguage]
  );

  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const isDFC = dfcSrc != null;

  if (popup.presentation === 'mobile-modal') {
    return createPortal(
      <div
        className={styles.mobileBackdrop}
        onClick={(event) => {
          if (event.target === event.currentTarget) clearCardPreview();
        }}
      >
        <div
          className={classNames(styles.mobileDialog, {
            [styles.mobileDialogDoubleFaced]: isDFC
          })}
          role="dialog"
          aria-modal="true"
          aria-label={t('PLAYER_INPUT.CLOSE_POPUP')}
        >
          <button
            type="button"
            className={styles.mobileCloseButton}
            aria-label={t('PLAYER_INPUT.CLOSE_POPUP')}
            onClick={clearCardPreview}
          >
            <MdClose aria-hidden="true" />
          </button>
          <div className={styles.mobileCardGroup}>
            {isDFC && (
              <CardDetails
                src={dfcSrc}
                containerClass={classNames(
                  styles.popUp,
                  styles.doubleFacedCard
                )}
                isOpponent={popup.isOpponent}
                showKeywords={false}
              />
            )}
            <CardDetails
              src={src}
              containerClass={styles.popUp}
              isOpponent={popup.isOpponent}
              isMeld={isMeld}
              cardNumber={cardNumber}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return createPortal(
      <CardDetails src={src} isMeld={isMeld} cardNumber={cardNumber} />,
      document.body
    );
  }

  const popUpStyle: Record<string, string> = {};

  if (isDFC) {
    // For DFC cards, position at cursor position and let absolute positioning handle left/right
    if (popup.xCoord > windowWidth / 2) {
      popUpStyle.right =
        (windowWidth - (popup.xCoord - popUpGap * hoverImageSize)).toString() +
        'px';
    } else {
      popUpStyle.left =
        (popup.xCoord + popUpGap * hoverImageSize * 3.5).toString() + 'px';
    }
  } else {
    // For single cards, use the existing logic to position left or right of cursor
    if (popup.xCoord > windowWidth / 2) {
      popUpStyle.right =
        (windowWidth - (popup.xCoord - popUpGap * hoverImageSize)).toString() +
        'px';
    } else {
      popUpStyle.left =
        (popup.xCoord + popUpGap * hoverImageSize).toString() + 'px';
    }
  }

  if (popup.yCoord < windowHeight / 2) {
    popUpStyle.top = ((popup.yCoord + popUpGap) / 2).toString() + 'px';
  } else {
    if (hoverImageSize < 1.1) {
      popUpStyle.bottom = (windowHeight - popup.yCoord).toString() + 'px';
    } else {
      popUpStyle.bottom = '10vh';
    }
  }

  return createPortal(
    <div className={styles.popUpContainer} style={popUpStyle}>
      {isDFC && (
        <CardDetails
          src={dfcSrc}
          containerClass={classNames(styles.popUp, styles.doubleFacedCard)}
          isOpponent={popup.isOpponent}
          showKeywords={false}
        />
      )}
      <CardDetails
        src={src}
        containerClass={styles.popUp}
        containerStyle={popUpStyle}
        isOpponent={popup.isOpponent}
        isMeld={isMeld}
        cardNumber={cardNumber}
      />
    </div>,
    document.body
  );
}
