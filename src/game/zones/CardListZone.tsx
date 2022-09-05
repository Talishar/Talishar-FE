import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { clearCardListFocus } from '../../features/game/GameSlice';
import CardDisplay from '../elements/CardDisplay';
import styles from './CardListZone.module.css';

export default function CardListZone() {
  const cardList = useSelector((state: RootState) => state.game.cardListFocus);
  const dispatch = useDispatch();
  if (cardList === undefined || cardList.cardList === undefined) {
    return null;
  }

  const closeCardList = () => {
    dispatch(clearCardListFocus());
  };

  const reversedList = [...cardList.cardList].reverse();

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{cardList.name}</h3>
          </div>
          <div className={styles.cardListCloseIcon} onClick={closeCardList}>
            <div>
              <h3 className={styles.title}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </h3>
            </div>
          </div>
        </div>
        <div className={styles.cardListContents}>
          {reversedList &&
            reversedList.map((card, ix) => {
              return <CardDisplay card={card} key={ix} />;
            })}
        </div>
      </div>
    </div>
  );
}
