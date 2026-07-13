import React from 'react';
import { RootState } from 'app/Store';
import { BiTargetLock } from 'react-icons/bi';
import styles from './CurrentAttack.module.css';
import attackSymbol from '../../../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../../../img/symbols/symbol-defense.png';
import CardDisplay from '../cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { hideChainLinkSummary, showChainLinkSummary } from 'features/game/GameSlice';

export default function CurrentAttack() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const chainLinkSummaryView = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary?.view
  );
  const dispatch = useAppDispatch();
  if (
    activeCombatChain === undefined ||
    activeCombatChain.attackingCard === undefined ||
    activeCombatChain.attackingCard.cardNumber === 'blank'
  ) {
    return <div className={styles.currentAttack} />;
  }
  const attackZoneDisplay = () => {
    dispatch(showChainLinkSummary({ chainLink: -1 }));
  };
  const showAttackPreview = () => {
    dispatch(showChainLinkSummary({ chainLink: -1, view: 'preview' }));
  };
  const hideAttackPreview = () => {
    if (chainLinkSummaryView === 'preview') {
      dispatch(hideChainLinkSummary());
    }
  };

  const powerValue = activeCombatChain.totalPower;
  const defValue = activeCombatChain.totalDefense;
  const attCard = activeCombatChain.attackingCard;
  const isPlayer = playerID === attCard.controller;

  const targets = activeCombatChain.attackTarget?.split('|');
  const tooltipText =
    targets && targets.length > 1
      ? `Attack targets: ${targets.join(', ')}`
      : `Attack target: ${targets?.[0]}`;

  return (
    <div className={styles.currentAttack}>
      <div className={styles.attDefRow}>
        <div className={styles.attDiv} data-testid="attack-value">
          {powerValue}
        </div>
        <div
          className={styles.attackSymbol}
          onClick={attackZoneDisplay}
          onPointerEnter={showAttackPreview}
          onPointerLeave={hideAttackPreview}
        >
          <img
            className={styles.chainSymbols}
            src={attackSymbol}
            alt="attack symbol"
          />
        </div>
        <div className={styles.defSymbol}>
          <img
            className={styles.chainSymbols}
            src={defSymbol}
            alt="defense symbol"
          />
        </div>
        <div className={styles.defDiv} data-testid="defense-value">
          {defValue}
        </div>
        {activeCombatChain.attackTarget ? (
          <div className={styles.icon} data-tooltip={tooltipText}>
            <BiTargetLock />
          </div>
        ) : null}
      </div>
      <div className={styles.attack}>
        <CardDisplay
          card={attCard}
          activeCombatChain={activeCombatChain}
          isPlayer={isPlayer}
        />
      </div>
    </div>
  );
}
