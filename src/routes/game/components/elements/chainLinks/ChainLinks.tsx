import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './ChainLinks.module.css';
import draconic from '../../../../../img/symbols/symbol-draconic.png';
import hit from '../../../../../img/symbols/symbol-hit.png';
import defend from '../../../../../img/symbols/symbol-defense.png';
import {
  hideChainLinkSummary,
  showChainLinkSummary,
  submitButton
} from 'features/game/GameSlice';
import { GiBreakingChain } from 'react-icons/gi';
import { PROCESS_INPUT } from 'appConstants';

export default function ChainLinks() {
  const oldCombatChain = useAppSelector(
    (state: RootState) => state.game.oldCombatChain
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const chainLinkSummaryView = useAppSelector(
    (state: RootState) => state.game.chainLinkSummary?.view
  );

  const dispatch = useAppDispatch();

  const isGameOver = !!turnPhase && turnPhase === 'OVER';

  const clickChainLink = (key: number) => {
    dispatch(showChainLinkSummary({ chainLink: key, view: 'all' }));
  };
  const previewChainLink = (key: number) => {
    dispatch(showChainLinkSummary({ chainLink: key, view: 'preview' }));
  };
  const hideChainLinkPreview = () => {
    if (chainLinkSummaryView === 'preview') {
      dispatch(hideChainLinkSummary());
    }
  };

  const handleBreakChainClick = () => {
    if (isGameOver) return;
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.BREAK_COMBAT_CHAIN } })
    );
  };

  if (oldCombatChain === undefined || oldCombatChain.length === 0) {
    return <div style={{ height: '3vh' }} />;
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
            onPointerEnter={() => previewChainLink(ix)}
            onPointerLeave={hideChainLinkPreview}
            title={ChainLink.isDraconic ? 'Draconic Chain Link' : ''}
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
        <div
          className={`${styles.breakChain} ${isGameOver ? styles.breakChainDisabled : ''}`}
          onClick={handleBreakChainClick}
          title={isGameOver ? 'Game over' : ''}
        >
          <GiBreakingChain className={styles.breakChainIcon} />
        </div>
      )}
    </div>
  );
}
