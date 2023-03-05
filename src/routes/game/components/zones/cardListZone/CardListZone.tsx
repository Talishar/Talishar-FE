import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';

export const CardListZone = () => {
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();

  const reversedList = cardList?.cardList
    ? [...cardList.cardList].reverse()
    : null;

  const closeCardList = () => {
    dispatch(clearCardListFocus());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  if (cardList === undefined || cardList?.active != true) {
    return null;
  }

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{cardList?.name}</h3>
          </div>
          <div className={styles.cardListCloseIcon} onClick={closeCardList}>
            <FaTimes title="close dialog" />
          </div>
        </div>
        {cardList?.apiCall ? (
          <CardListZoneAPI name={cardList.apiQuery ?? ''} />
        ) : (
          <div className={styles.cardListContents}>
            {reversedList &&
              reversedList.map((card, ix) => {
                return <CardDisplay card={card} key={ix} />;
              })}
          </div>
        )}
      </div>
    </div>
  );
};

interface CardListZoneAPI {
  name: string;
}

const CardListZoneAPI = ({ name }: CardListZoneAPI) => {
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    popupType: name
  });

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  }
  if (isError) {
    content = <div>Error!</div>;
  }
  if (data != undefined) {
    content = (
      <div>
        {data.cards.map((card: any, ix: number) => {
          return <CardDisplay card={card} key={ix} />;
        })}
      </div>
    );
  }

  return <>{content}</>;
};

export default CardListZone;
