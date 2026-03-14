import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './Inventory.module.css';
import { createPortal } from 'react-dom';
import { MdClose, MdInventory2 } from 'react-icons/md';
import CardPopUp from '../cardPopUp/CardPopUp';
import CardImage from '../cardImage/CardImage';

export default function Inventory({ buttonClassName, showLabel }: { buttonClassName?: string; showLabel?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const gameState = useAppSelector((state: RootState) => state.game);
  const playerID = gameState?.gameInfo?.playerID;

  const inventoryCards = gameState?.gameDynamicInfo?.playerInventory || [];

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={buttonClassName ?? styles.inventoryButton}
        onClick={() => setIsOpen(true)}
        data-tooltip={'View your inventory'}
        data-placement="bottom"
        aria-label="Inventory"
      >
        <MdInventory2 />
        {showLabel && ' Inventory'}
      </button>

      {isOpen &&
        createPortal(
          <div className={styles.modalBackdrop} onClick={handleClose}>
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
                  onClick={handleClose}
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
                            src={`https://images.talishar.net/public/cardsquares/english/${card.cardNumber}.webp`}
                            className={styles.cardImage}
                          />
                        </CardPopUp>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
