import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import {
  clearCardListFocus,
  hideChainLinkSummary
} from '../../../features/game/GameSlice';
import CardDisplay from '../cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './ChainLinkSummary.module.css';
import { useGetPopUpContentQuery } from '../../../features/api/apiSlice';
import GameInfo from '../../../features/GameInfo';

export const ChainLinkSummaryContainer = () => {
  const chainLinkSummary = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);

  if (!chainLinkSummary) {
    return null;
  }

  return (
    <div>
      <ChainLinkSummary {...gameInfo} />
    </div>
  );
};

const ChainLinkSummary = ({
  gameID,
  playerID,
  authKey,
  lastUpdate
}: GameInfo) => {
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameName: gameID,
    playerNo: playerID,
    authKey: authKey,
    popupType: 'attackSummary',
    lastUpdate: lastUpdate
  });
  const dispatch = useAppDispatch();

  const closeCardList = () => {
    dispatch(hideChainLinkSummary());
  };
  let content;

  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>{String(error)}</div>;
  } else {
    content = (
      <div className={styles.cardListContents}>{JSON.stringify(data)}</div>
    );
  }

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{'Chain Link Summary'}</h3>
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

export default ChainLinkSummaryContainer;
