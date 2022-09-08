import React from 'react';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import styles from './CardPopUp.module.css';

const popUpGap = 10;

export default function CardPopUp() {
  const popup = useAppSelector((state: RootState) => state.game.popup);
  let isDFC = false;
  let dfcValue = '';
  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const src = `https://www.fleshandbloodonline.com/FaBOnline2/WebpImages/${popup.popupCard.cardNumber}.webp`;

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return (
      <div className={styles.defaultPos + ' ' + styles.popUp}>
        <div className={styles.popUpInside}>
          <img src={src} className={styles.img} />
        </div>
      </div>
    );
  }

  switch (popup.popupCard.cardNumber) {
    case 'UPR006': {
      isDFC = true;
      dfcValue = 'UPR406';
      break;
    }
    case 'UPR007': {
      isDFC = true;
      dfcValue = 'UPR407';
      break;
    }
    case 'UPR008': {
      isDFC = true;
      dfcValue = 'UPR408';
      break;
    }
    case 'UPR009': {
      isDFC = true;
      dfcValue = 'UPR409';
      break;
    }
    case 'UPR409': {
      isDFC = true;
      dfcValue = 'UPR009';
      break;
    }
    case 'UPR010': {
      isDFC = true;
      dfcValue = 'UPR410';
      break;
    }
    case 'UPR011': {
      isDFC = true;
      dfcValue = 'UPR411';
      break;
    }
    case 'UPR012': {
      isDFC = true;
      dfcValue = 'UPR412';
      break;
    }
    case 'UPR013': {
      isDFC = true;
      dfcValue = 'UPR413';
      break;
    }
    case 'UPR014': {
      isDFC = true;
      dfcValue = 'UPR414';
      break;
    }
    case 'UPR015': {
      isDFC = true;
      dfcValue = 'UPR415';
      break;
    }
    case 'UPR016': {
      isDFC = true;
      dfcValue = 'UPR416';
      break;
    }
    case 'UPR017': {
      isDFC = true;
      dfcValue = 'UPR417';
      break;
    }
  }

  const popUpStyle: Record<string, string> = {};

  if (popup.xCoord > window.innerWidth / 2) {
    popUpStyle.right =
      (window.innerWidth - (popup.xCoord - popUpGap)).toString() + 'px';
  } else {
    popUpStyle.left = (popup.xCoord + popUpGap).toString() + 'px';
  }

  if (popup.yCoord < window.innerHeight / 2) {
    popUpStyle.top = popup.yCoord.toString() + 'px';
  } else {
    popUpStyle.bottom =
      (window.innerHeight - popup.yCoord + popUpGap).toString() + 'px';
  }

  const dfcStyle: Record<string, string> = {};

  dfcStyle.left = '-270px';
  dfcStyle.position = 'absolute';

  const dfcURL = `https://www.fleshandbloodonline.com/FaBOnline2/WebpImages/${dfcValue}.webp`;

  return (
    <div className={styles.popUp} style={popUpStyle}>
      {isDFC && (
        <div className={styles.popUp} style={dfcStyle}>
          <div className={styles.popUpInside}>
            <img src={dfcURL} className={styles.img} />
          </div>
        </div>
      )}
      <div className={styles.popUpInside}>
        <img src={src} className={styles.img} />
      </div>
    </div>
  );
}
