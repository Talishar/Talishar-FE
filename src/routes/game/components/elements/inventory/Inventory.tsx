import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import styles from './Inventory.module.css';
import { MdInventory2 } from 'react-icons/md';
import { openInventory } from 'features/game/GameSlice';

export default function Inventory({ buttonClassName, showLabel }: { buttonClassName?: string; showLabel?: boolean }) {
  const dispatch = useAppDispatch();

  return (
    <button
      className={buttonClassName ?? styles.inventoryButton}
      onClick={(e) => { e.stopPropagation(); dispatch(openInventory()); }}
      data-tooltip={'View your inventory'}
      data-placement="bottom"
      aria-label="Inventory"
    >
      <MdInventory2 />
      {showLabel && ' Inventory'}
    </button>
  );
}
