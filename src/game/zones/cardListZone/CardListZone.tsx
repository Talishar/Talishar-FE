import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import { clearCardListFocus } from '../../../features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from '../../../features/api/apiSlice';

export const CardListZone = () => {
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameName: gameInfo.gameID,
    playerNo: gameInfo.playerID,
    authKey: gameInfo.authKey,
    popupType: cardList?.popupType
  });

  if (cardList === undefined) {
    return null;
  }

  const closeCardList = () => {
    dispatch(clearCardListFocus());
  };

  let content;
  const reversedList = cardList.cardList
    ? [...cardList.cardList].reverse()
    : undefined;

  if (!cardList.apiCall) {
    console.log('not api');
    content = (
      <div className={styles.cardListContents}>
        {reversedList &&
          reversedList.map((card, ix) => {
            return <CardDisplay card={card} key={ix} />;
          })}
      </div>
    );
  } else {
    console.log('is api');
    if (isLoading) {
      content = <div>Loading...</div>;
    } else if (error) {
      content = <div>{String(error)}</div>;
    } else {
      content = (
        <div className={styles.cardListContents}>{JSON.stringify(data)}</div>
      );
    }
  }

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{cardList.name}</h3>
          </div>
          <div className={styles.cardListCloseIcon} onClick={closeCardList}>
            <FaTimes title="close dialog" />
          </div>
        </div>
        {content}
      </div>
    </div>
  );
};

export default CardListZone;