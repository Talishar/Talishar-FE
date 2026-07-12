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
import { Effect } from '../effects/Effects';
import { Card } from 'features/Card';
import EndGameScreen from '../endGameScreen/EndGameScreen';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { shallowEqual } from 'react-redux';
import { CSSProperties, useEffect } from 'react';

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

interface ChainLinkCard {
  Player: string | number;
  Name: string;
  cardID: string;
  modifier: number;
  pitch?: number | string;
}

const PITCH_COLORS: Record<number, string> = {
  1: '#af1518',
  2: '#daa520',
  3: '#4b84ff'
};
const pitchColor = (pitch?: number | string): string | undefined =>
  PITCH_COLORS[Number(pitch)];

const CardRow = ({
  entry,
  isPlayer,
  value,
  signed
}: {
  entry: ChainLinkCard;
  isPlayer: boolean;
  value?: number;
  signed?: boolean;
}) => {
  const card: Card = { cardNumber: entry.cardID };
  const color = pitchColor(entry.pitch);
  const artStyle = {
    '--pitch-color': color ?? 'rgba(219, 209, 163, 0.5)',
    '--pitch-glow': color ? `${color}66` : 'transparent'
  } as CSSProperties;
  const nameStyle = color ? { color, fontWeight: 600 } : undefined;
  const valueClass = signed
    ? (value ?? 0) > 0
      ? styles.rowValPos
      : (value ?? 0) < 0
      ? styles.rowValNeg
      : styles.rowValNeutral
    : styles.rowVal;
  return (
    <div className={styles.row}>
      <div className={styles.rowIcon}>
        {entry.cardID === 'POWERCOUNTER' ? (
          <img
            src={attackSymbol}
            className={styles.attackSymbol}
            alt="+1 Power Counter"
          />
        ) : (
          <div className={styles.pitchArt} style={artStyle}>
            <Effect
              card={card}
              isPlayer={isPlayer}
              imgClassName={styles.pitchImg}
            />
          </div>
        )}
      </div>
      <div className={styles.rowName} style={nameStyle}>
        {entry.Name}
      </div>
      {value !== undefined && (
        <div className={valueClass}>
          {signed && value > 0 ? '+' : ''}
          {value}
        </div>
      )}
    </div>
  );
};

const ChainLinkSummary = ({
  gameID,
  playerID,
  authKey,
  chainLinkIndex,
  lastUpdate
}: ChainLinkSummaryProps) => {
  const isResolvedLink = chainLinkIndex != null && chainLinkIndex >= 0;

  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameID,
    playerID: playerID,
    authKey: authKey,
    popupType: isResolvedLink ? 'chainLinkPopup' : 'attackSummary',
    index: chainLinkIndex,
    lastUpdate: lastUpdate
  });

  const didItHitFromRedux = useAppSelector((state: RootState) =>
    isResolvedLink
      ? state.game.oldCombatChain?.[chainLinkIndex]?.didItHit
      : undefined
  );

  const dispatch = useAppDispatch();

  const closeCardList = () => {
    dispatch(hideChainLinkSummary());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  const title = isResolvedLink
    ? `Chain Link ${(chainLinkIndex ?? 0) + 1}`
    : 'Current Attack';

  let content;
  let headerBadge: React.ReactNode = null;

  if (isLoading) {
    content = <div className={styles.info}>Loading…</div>;
  } else if (error) {
    const errorMsg =
      'status' in (error as object)
        ? `Error ${(error as { status: number }).status}`
        : 'Failed to load chain link summary';
    content = <div className={styles.error}>{errorMsg}</div>;
  } else if (!data?.Cards) {
    content = <div className={styles.error}>{JSON.stringify(data)}</div>;
  } else {
    const cards: ChainLinkCard[] = data.Cards;

    const attackerPID =
      data.AttackingPlayerID != null
        ? Number(data.AttackingPlayerID)
        : cards.length > 0
        ? Number(cards[0].Player)
        : Number(playerID);

    const attackCards = cards.filter((c) => Number(c.Player) === attackerPID);
    const blockCards = cards.filter((c) => Number(c.Player) !== attackerPID);
    const isAttackerYou = attackerPID === Number(playerID);

    if (isResolvedLink) {
      const damage = Number(data.TotalDamageDealt) || 0;
      const totalAttack =
        data.TotalAttack != null
          ? Number(data.TotalAttack)
          : attackCards.reduce((sum, c) => sum + (Number(c.modifier) || 0), 0);
      const totalBlock = blockCards.reduce(
        (sum, c) => sum + (Number(c.modifier) || 0),
        0
      );
      const didHit =
        data.DidItHit != null
          ? !!data.DidItHit
          : didItHitFromRedux ?? damage > 0;

      const hasBlockers = blockCards.length > 0;
      const reductionValue = hasBlockers
        ? totalBlock
        : Math.max(0, totalAttack - damage);
      const reductionLabel = hasBlockers ? 'Blocked' : 'Prevented';

      headerBadge = (
        <span
          className={`${styles.badge} ${didHit ? styles.hit : styles.noHit}`}
        >
          {didHit ? 'Hit' : 'No hit'}
        </span>
      );

      content = (
        <>
          <div className={styles.ledger}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{totalAttack}</div>
              <div className={styles.statLabel}>Attack</div>
            </div>
            {reductionValue > 0 && (
              <>
                <div className={styles.op}>−</div>
                <div className={styles.stat}>
                  <div className={styles.statNum}>{reductionValue}</div>
                  <div className={styles.statLabel}>{reductionLabel}</div>
                </div>
              </>
            )}
            <div className={styles.op}>→</div>
            <div className={styles.stat}>
              <div className={`${styles.statNum} ${styles.dmgNum}`}>
                {damage}
              </div>
              <div className={styles.statLabel}>Damage</div>
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.sectionLabel}>Attack</div>
            {attackCards.length > 0 ? (
              attackCards.map((entry, ix) => (
                <CardRow
                  key={`atk-${entry.cardID}-${ix}`}
                  entry={entry}
                  isPlayer={isAttackerYou}
                  value={Number(entry.modifier) || 0}
                />
              ))
            ) : (
              <div className={styles.emptyRow}>No attacker</div>
            )}

            <div className={styles.sectionLabel}>Blocks</div>
            {hasBlockers ? (
              blockCards.map((entry, ix) => (
                <CardRow
                  key={`blk-${entry.cardID}-${ix}`}
                  entry={entry}
                  isPlayer={!isAttackerYou}
                  value={Number(entry.modifier) || 0}
                />
              ))
            ) : (
              <div className={styles.emptyRow}>No blocks</div>
            )}
          </div>
        </>
      );
    } else {
      content = (
        <div className={styles.body}>
          <div className={styles.sectionLabel}>Attack modifiers</div>
          {cards.length > 0 ? (
            cards.map((entry, ix) => (
              <CardRow
                key={`mod-${entry.cardID}-${ix}`}
                entry={entry}
                isPlayer={Number(entry.Player) === Number(playerID)}
                value={Number(entry.modifier) || 0}
                signed
              />
            ))
          ) : (
            <div className={styles.emptyRow}>No modifiers</div>
          )}
        </div>
      );
    }
  }

  return (
    <div className={styles.emptyOutside} onClick={closeCardList}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{title}</h3>
            {headerBadge}
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
