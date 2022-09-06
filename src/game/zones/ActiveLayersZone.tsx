import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import CardDisplay from '../elements/CardDisplay';
import styles from './ActiveLayersZone.module.css';

export default function ActiveLayersZone() {
  const activeLayer = useSelector(
    (state: RootState) => state.game.activeLayers
  );
  // const dispatch = useDispatch();
  if (
    activeLayer === undefined ||
    activeLayer.active === false ||
    activeLayer.cardList === undefined
  ) {
    return null;
  }

  return (
    <div className={styles.activeLayersBox}>
      <div className={styles.activeLayersTitleContainer}>
        <div className={styles.activeLayersTitle}>
          <h3 className={styles.title}>Active Layers</h3>
          (priority settings can be adjusted in the menu)
        </div>
      </div>
      <div className={styles.activeLayersContents}>
        {activeLayer.cardList &&
          activeLayer.cardList.map((card, ix) => {
            return <CardDisplay card={card} key={ix} />;
          })}
      </div>
    </div>
  );
}
