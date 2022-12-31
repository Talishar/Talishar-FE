import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import { hideChainLinkSummary } from '../../../features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './ChainLinkSummary.module.css';
import { useGetPopUpContentQuery } from '../../../features/api/apiSlice';
import GameInfo from '../../../features/GameInfo';
import CardTextLink from '../cardTextLink/CardTextLink';

export const ChainLinkSummaryContainer = () => {
  const chainLinkSummary = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);

  if (!chainLinkSummary || !chainLinkSummary.show) {
    return null;
  }

  const props = { chainLinkIndex: chainLinkSummary.index, ...gameInfo };
  return (
    <div>
      <ChainLinkSummary {...props} />
    </div>
  );
};

interface ChainLinkSummaryProps extends GameInfo {
  chainLinkIndex?: number;
}

const ChainLinkSummary = ({
  gameID,
  playerID,
  authKey,
  chainLinkIndex,
  lastUpdate
}: ChainLinkSummaryProps) => {
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameName: gameID,
    playerNo: playerID,
    authKey: authKey,
    popupType: chainLinkIndex != -1 ? 'chainLinkPopup' : 'attackSummary',
    index: chainLinkIndex,
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
      <div className={styles.cardListContents}>
        {data.Cards != undefined ? (
          data.Cards.map((entry: any, ix: number) => {
            return (
              <div key={`cardList${ix}`}>
                <b>
                  <CardTextLink cardName={entry.Name} cardID={entry.cardID} />
                </b>{' '}
                gives {entry.modifier > 0 ? '+' : ''}
                {entry.modifier}
              </div>
            );
          })
        ) : (
          <div>{JSON.stringify(data)}</div>
        )}
      </div>
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
