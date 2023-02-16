import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { hideChainLinkSummary, hideActiveLayer } from 'features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './ChainLinkSummary.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import GameInfo from 'features/GameInfo';
import CardTextLink from '../cardTextLink/CardTextLink';
import { Effect } from '../effects/Effects';
import { Card } from 'features/Card';
import EndGameScreen from '../endGameScreen/EndGameScreen';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'constants';

export const ChainLinkSummaryContainer = () => {
  const chainLinkSummary = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );

  const dispatch = useAppDispatch();

  // if the game is over display the end game stats screen
  if (!!turnPhase && turnPhase === 'OVER') {
    dispatch(hideActiveLayer());
    return (
      <div>
        <EndGameScreen />
      </div>
    );
  }

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
    gameID: gameID,
    playerID: playerID,
    authKey: authKey,
    popupType: chainLinkIndex != -1 ? 'chainLinkPopup' : 'attackSummary',
    index: chainLinkIndex,
    lastUpdate: lastUpdate
  });
  const dispatch = useAppDispatch();

  const closeCardList = () => {
    dispatch(hideChainLinkSummary());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  let content;

  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>{JSON.stringify(error)}</div>;
  } else {
    content = (
      <div className={styles.cardListContents}>
        <div>Total Damage: {data.TotalDamageDealt}</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.leftColumn}></th>
              <th className={styles.midColumn}>Card</th>
              <th className={styles.rightColumn}>Effect</th>
            </tr>
          </thead>
          <tbody>
            {data.Cards != undefined ? (
              data.Cards.map((entry: any, ix: number) => {
                const card: Card = { cardNumber: entry.cardID };
                return (
                  <tr key={`cardList${ix}`}>
                    <td className={styles.column}>
                      <Effect card={card} />
                    </td>
                    <td className={styles.column}>
                      <CardTextLink
                        cardName={entry.Name}
                        cardNumber={entry.cardID}
                      />
                    </td>
                    <td className={styles.column}>
                      {entry.modifier > 0 ? '+' : ''}
                      {entry.modifier}
                    </td>
                  </tr>
                );
              })
            ) : (
              <div>{JSON.stringify(data)}</div>
            )}
          </tbody>
        </table>
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
