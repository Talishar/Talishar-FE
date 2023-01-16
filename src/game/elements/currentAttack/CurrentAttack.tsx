import React from 'react';
import { RootState } from '../../../app/Store';
import { BiBullseye } from 'react-icons/bi';
import { GiZigzagLeaf, GiElectric, GiCycle, GiShield } from 'react-icons/gi';
import styles from './CurrentAttack.module.css';
import attackSymbol from '../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../img/symbols/symbol-defence.png';
import CardDisplay from '../cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import {
  setCardListFocus,
  showChainLinkSummary
} from '../../../features/game/GameSlice';

export default function CurrentAttack() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
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

  const attackValue = activeCombatChain.totalAttack;
  const defValue = activeCombatChain.totalDefence;
  const attCard = activeCombatChain.attackingCard;

  return (
    <div className={styles.currentAttack}>
      <div className={styles.attDefRow}>
        <div className={styles.attDiv}>{attackValue}</div>
        <div className={styles.attackSymbol} onClick={attackZoneDisplay}>
          <img
            className={styles.chainSymbols}
            src={attackSymbol}
            alt="attack symbol"
          />
        </div>
        <div className={styles.attackSymbol}>
          <img
            className={styles.chainSymbols}
            src={defSymbol}
            alt="defence symbol"
          />
        </div>
        <div className={styles.defDiv}>{defValue}</div>
      </div>
      <div className={styles.attack}>
        <CardDisplay card={attCard} makeMeBigger={true} />
        <div className={styles.floatCover}>
          {activeCombatChain.goAgain ? (
            <div className={styles.icon} title="Go Again">
              <GiCycle />
            </div>
          ) : null}
          {activeCombatChain.dominate ? (
            <div className={styles.icon} title="Dominate">
              <BiBullseye />
            </div>
          ) : null}
          {activeCombatChain.overpower ? (
            <div className={styles.icon} title="Overpower">
              <GiElectric />
            </div>
          ) : null}
          {activeCombatChain.fused ? (
            <div className={styles.icon} title="Fused">
              <GiZigzagLeaf />
            </div>
          ) : null}
          {activeCombatChain.damagePrevention ? (
            <div
              className={styles.icon}
              title={`${activeCombatChain.damagePrevention} Damage Prevention`}
            >
              <GiShield />
              {activeCombatChain.damagePrevention}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
