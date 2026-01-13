import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './Inventory.module.css';
import { createPortal } from 'react-dom';
import { MdClose, MdInventory2 } from 'react-icons/md';

export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const gameState = useAppSelector((state: RootState) => state.game);
  const playerID = gameState?.gameInfo?.playerID;

  const inventoryCards = gameState?.gameDynamicInfo?.playerInventory || [];
  const isSpectator = playerID === 3;
  
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={styles.inventoryButton}
        onClick={() => setIsOpen(true)}
        data-tooltip={isSpectator ? "Spectators cannot access inventory" : "View your inventory"}
        data-placement="bottom"
        aria-label="Inventory"
        disabled={isSpectator}
      >
        <MdInventory2 />
      </button>

      {isOpen && createPortal(
        <div className={styles.modalBackdrop} onClick={handleClose}>
          <dialog open className={styles.inventoryModal} onClick={(e) => e.stopPropagation()}>
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
                      <div className={styles.cardItem}>
                        <img
                          src={`https://images.talishar.net/public/cardsquares/english/${card.cardNumber}.webp`}
                          alt={card.cardNumber}
                          className={styles.cardImage}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </dialog>
        </div>,
        document.body
      )}
    </>
  );
}
