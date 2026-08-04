import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './Inventory.module.css';
import { MdClose } from 'react-icons/md';
import CardPopUp from '../cardPopUp/CardPopUp';
import CardImage from '../cardImage/CardImage';
import { closeInventory } from 'features/game/GameSlice';
import { Card } from 'features/Card';
import { useTranslation } from 'react-i18next';

const emptyArray: any[] = [];

export default function InventoryModal() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isOpen = useAppSelector((state: RootState) => state.game.inventoryOpen);
  const inventoryCards = useAppSelector(
    (state: RootState) =>
      state.game.gameDynamicInfo?.playerInventory ?? emptyArray
  );

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={() => dispatch(closeInventory())}
    >
      <div
        className={styles.inventoryModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('INVENTORY.TITLE')}
      >
        <div className={styles.modalHeader}>
          <h2>{t('INVENTORY.TITLE')}</h2>
          <button
            className={styles.closeButton}
            onClick={() => dispatch(closeInventory())}
            aria-label={t('INVENTORY.CLOSE')}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {inventoryCards.length === 0 ? (
            <p className={styles.emptyState}>{t('INVENTORY.EMPTY')}</p>
          ) : (
            <div className={styles.cardGrid}>
              {inventoryCards.map((card: Card, index: number) => (
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
    </div>
  );
}
