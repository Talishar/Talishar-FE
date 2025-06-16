import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './ActiveLayersZone.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import ReorderLayers from './ReorderLayers';
import useShowModal from 'hooks/useShowModals';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import { replaceText } from 'utils/ParseEscapedString';
import { BiTargetLock } from 'react-icons/bi';
import Button from '../../../../../features/Button';

export default function ActiveLayersZone() {
  const showModal = useShowModal();
  const activeLayer = useAppSelector(
    (state: RootState) => state.game.activeLayers
  );
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const dispatch = useAppDispatch();
  const staticCards = activeLayer?.cardList?.filter(
    (card) => card.reorderable === false
  );
  const reorderableCards = activeLayer?.cardList?.filter(
    (card) => card.reorderable
  );

  const handlePassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickPromptButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const buttons = playerPrompt?.buttons?.map((button, ix) => {
    return (
      <button
        className={styles.buttonDiv}
        onClick={(e) => {
          e.preventDefault();
          clickPromptButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </button>
    );
  });

  return (
    <AnimatePresence>
      {activeLayer?.active && showModal && (
        <motion.div
          className={styles.activeLayersBox}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          key="activeLayersBox"
        >
          <div className={styles.activeLayersTitle}>
            <div className={styles.titlesColumn}>
              <h3 className={styles.title}>
                Active Layers
                {activeLayer.isReorderable
                  ? ' (Drag highlighted to reorder)'
                  : null}
              </h3>
              <Target target={activeLayer.target} />
              <p className={styles.orderingExplanation}>
                Priority settings can be adjusted in the menu
              </p>
            </div>
              {canPassPhase && (
              <div className={styles.passTurnBox}>
                <button className={styles.passTurn} onClick={handlePassTurn}>
                  Pass
                </button>
              </div>
            )}
          </div>
          <div className={styles.activeLayersContents}>
            {staticCards &&
              staticCards.map((card, ix) => {
                return <CardDisplay card={card} key={ix} />;
              })}
            <ReorderLayers cards={reorderableCards ?? []} />
          </div>
          <div className={styles.activeLayersCallToAction}>
            <div
              dangerouslySetInnerHTML={{ __html: playerPrompt?.helpText ?? '' }}
            ></div>
            {buttons}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Target = ({ target }: { target: string | undefined }) => {
  return target ? (
    <div className={styles.targetContainer}>
      <BiTargetLock />{' '}
      <span
        className={styles.target}
        dangerouslySetInnerHTML={{
          __html: replaceText(target?.replace('|', ', '))
        }}
      ></span>
    </div>
  ) : null;
};