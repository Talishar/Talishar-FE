import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './ActiveLayersZone.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import ReorderLayers from './reorderLayers';

export default function ActiveLayersZone() {
  const activeLayer = useAppSelector(
    (state: RootState) => state.game.activeLayers
  );

  return (
    <AnimatePresence>
      {activeLayer?.active && (
        <motion.div
          className={styles.activeLayersBox}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          key="activeLayersBox"
        >
          <div className={styles.activeLayersTitleContainer}>
            <div className={styles.activeLayersTitle}>
              <h3 className={styles.title}>Active Layers</h3>
              (priority settings can be adjusted in the menu)
            </div>
          </div>
          {activeLayer.isReorderable ? (
            <ReorderLayers cards={activeLayer.cardList ?? []} />
          ) : (
            <div className={styles.activeLayersContents}>
              {activeLayer.cardList &&
                activeLayer.cardList.map((card, ix) => {
                  return <CardDisplay card={card} key={ix} makeMeBigger />;
                })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
