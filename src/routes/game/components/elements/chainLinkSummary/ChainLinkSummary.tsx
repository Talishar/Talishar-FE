import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  hideChainLinkSummary,
  hideActiveLayer,
  getGameInfo
} from 'features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './ChainLinkSummary.module.css';
import attackSymbol from '../../../../../img/symbols/symbol-attack.png';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import GameStaticInfo from 'features/GameStaticInfo';
import CardTextLink from '../cardTextLink/CardTextLink';
import { Effect } from '../effects/Effects';
import { Card } from 'features/Card';
import EndGameScreen from '../endGameScreen/EndGameScreen';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { shallowEqual } from 'react-redux';
import { useEffect } from 'react';

export const ChainLinkSummaryContainer = () => {
  const chainLinkSummary = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary,
    shallowEqual
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const hasGameEnded = useAppSelector(
    (state: RootState) => state.game.hasGameEnded
  );
  const lastUpdate = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );

  const dispatch = useAppDispatch();

  // if the game is over display the end game stats screen
  useEffect(() => {
    if (!!turnPhase && turnPhase === 'OVER') {
      dispatch(hideActiveLayer());
    }
  }, [turnPhase, dispatch]);

  if (!chainLinkSummary || !chainLinkSummary.show) {
    if (hasGameEnded) {
      return (
        <div>
          <EndGameScreen />
        </div>
      );
    }
    return null;
  }

  const props = {
    chainLinkIndex: chainLinkSummary.index,
    lastUpdate: lastUpdate,
    ...gameInfo
  };
  return (
    <div>
      <ChainLinkSummary {...props} />
    </div>
  );
};

interface ChainLinkSummaryProps extends GameStaticInfo {
  chainLinkIndex?: number;
  lastUpdate?: number;
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
    const errorMsg = 'status' in (error as object)
      ? `Error ${(error as { status: number }).status}`
      : 'Failed to load chain link summary';
    content = <div className={styles.error}>{errorMsg}</div>;
  } else {
    content = (
      <div className={styles.cardListContents}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.cardImageCol}></th>
                <th className={styles.cardNameCol}>Card</th>
                <th className={styles.effectCol}>Effect</th>
              </tr>
            </thead>
            <tbody>
              {data.Cards != undefined ? (
                data.Cards.map((entry: any, ix: number) => {
                  const card: Card = { cardNumber: entry.cardID };
                  const isPlayer = parseInt(entry.Player) === playerID;
                  const rowClass = `${styles.tableRow} ${isPlayer ? styles.playerRow : styles.opponentRow}`;
                  const glowClass = isPlayer ? styles.playerGlow : styles.opponentGlow;
                  return (
                    <tr key={`${entry.cardID}-${ix}`} className={rowClass}>
                      <td className={styles.cardImageCol}>
                        {entry.cardID === 'POWERCOUNTER' ? (
                          <img
                            src={attackSymbol}
                            className={styles.attackSymbol}
                            alt="+1 Power Counter"
                          />
                        ) : (
                          <div className={glowClass}>
                            <Effect card={card} isPlayer={isPlayer} />
                          </div>
                        )}
                      </td>
                      <td className={styles.cardNameCol}>
                        <span>{entry.Name}</span>
                      </td>
                      <td className={styles.effectCol}>
                        <span
                          className={
                            entry.modifier > 0
                              ? styles.positive
                              : entry.modifier < 0
                              ? styles.negative
                              : styles.neutral
                          }
                        >
                          {entry.modifier > 0 ? '+' : ''}
                          {entry.modifier === 0 ? '-' : entry.modifier}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className={styles.error}>
                    {JSON.stringify(data)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const totalDamage =
    !isLoading && !error && data ? data.TotalDamageDealt : null;

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>Chain Link Summary</h3>
            {totalDamage != null && (
              <div className={styles.totalDamageContainer}>
                <span className={styles.totalDamageLabel}>
                  Total Damage Dealt:
                </span>
                <span className={styles.totalDamageValue}>{totalDamage}</span>
              </div>
            )}
          </div>
          <div className={styles.cardListCloseIcon} onClick={closeCardList}>
            <FaTimes title="Close Dialog" />
          </div>
        </div>
        {content}
      </div>
    </div>
  );
};

export default ChainLinkSummaryContainer;
