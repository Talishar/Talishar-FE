import { useAppDispatch } from 'app/Hooks';
import styles from './Inventory.module.css';
import { MdInventory2 } from 'react-icons/md';
import { openInventory } from 'features/game/GameSlice';
import { useTranslation } from 'react-i18next';

export default function Inventory({
  buttonClassName,
  showLabel
}: {
  buttonClassName?: string;
  showLabel?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <button
      className={buttonClassName ?? styles.inventoryButton}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(openInventory());
      }}
      data-tooltip={t('INVENTORY.VIEW')}
      data-placement="bottom"
      aria-label={t('INVENTORY.TITLE')}
    >
      <MdInventory2 />
      {showLabel && ` ${t('INVENTORY.TITLE')}`}
    </button>
  );
}
