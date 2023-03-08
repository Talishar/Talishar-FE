import React, { ReactHTMLElement } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './ChainLinks.module.css';
import draconic from '../../../../../img/symbols/symbol-draconic.png';
import hit from '../../../../../img/symbols/symbol-hit.png';
import defend from '../../../../../img/symbols/symbol-defence.png';
import { showChainLinkSummary, submitButton } from 'features/game/GameSlice';
import { GiBreakingChain } from 'react-icons/gi';
import { PROCESS_INPUT } from 'appConstants';

export default function ChainLinks() {
  const oldCombatChain = useAppSelector(
    (state: RootState) => state.game.oldCombatChain
  );

  const dispatch = useAppDispatch();

  const clickChainLink = (key: number) => {
    dispatch(showChainLinkSummary({ chainLink: key }));
  };

  const handleBreakChainClick = () => {
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.BREAK_COMBAT_CHAIN } })
    );
  };

  if (oldCombatChain === undefined || oldCombatChain.length === 0) {
    return <div className={styles.chainLinksRow} />;
  }

  return (
    <div className={styles.chainLinksRow}>
      {oldCombatChain.map((ChainLink, ix) => {
        const hitPic = ChainLink.didItHit ? hit : defend;
        return (
          <div
            className={styles.chainLinkSummary}
            key={ix.toString()}
            onClick={() => clickChainLink(ix)}
          >
            <div className={styles.chainLinkSymbol}>
              <img src={hitPic} className={styles.chainLinkSymbol} />
              {ChainLink.isDraconic === true ? (
                <div className={styles.draconicChainLinkContainer}>
                  <img
                    src={draconic}
                    className={styles.draconicChainLinkSymbol}
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {oldCombatChain.length > 0 && (
        <div className={styles.breakChain} onClick={handleBreakChainClick}>
          <GiBreakingChain style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}
