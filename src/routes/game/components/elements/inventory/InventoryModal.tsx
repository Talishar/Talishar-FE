import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './Inventory.module.css';
import { MdClose } from 'react-icons/md';
import CardPopUp from '../cardPopUp/CardPopUp';
import CardImage from '../cardImage/CardImage';
import { closeInventory } from 'features/game/GameSlice';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

export default function InventoryModal() {
  const dispatch = useAppDispatch();
  const { getLanguage } = useLanguageSelector();
  const locale = getLanguage();
  const isOpen = useAppSelector((state: RootState) => state.game.inventoryOpen);
  const inventoryCards = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo?.playerInventory || []
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={() => dispatch(closeInventory())}>
      <div
        className={styles.inventoryModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Inventory"
      >
        <div className={styles.modalHeader}>
          <h2>Inventory</h2>
          <button
            className={styles.closeButton}
            onClick={() => dispatch(closeInventory())}
            aria-label="Close inventory"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {inventoryCards.length === 0 ? (
            <p className={styles.emptyState}>No items in inventory</p>
          ) : (
            <div className={styles.cardGrid}>
              {inventoryCards.map((card, index) => (
                <div key={index} className={styles.cardContainer}>
                  <CardPopUp
                    cardNumber={card.cardNumber}
                    containerClass={styles.cardItem}
                  >
                    <CardImage
                      src={getCollectionCardImagePath({
                        path: CARD_SQUARES_PATH,
                        locale,
                        cardNumber: card.cardNumber
                      })}
                      className={styles.cardImage}
                    />
                  </CardPopUp>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
