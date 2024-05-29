import React from 'react';
import screenfull from 'screenfull';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand } from 'react-icons/gi';
import styles from './PriorityControl.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import SkipAttackReactionsToggle from './SkipAttackReactions/SkipAttackReactionsToggle';
import SkipDefenseReactionsToggle from './SkipDefenseReactions/SkipDefenseReactionsToggle';
import SkipAllAttacksToggle from './SkipAllAttacks/SkipAllAttacksToggle';
import Skip1PowerAttacksToggle from './Skip1PowerAttacks/Skip1PowerAttacksToggle';
import useShortcut from 'hooks/useShortcut';

function FullScreenButton() {
  function toggleFullScreen() {
    screenfull.toggle();
  }

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Full Screen"
        title="Full Screen"
        onClick={() => toggleFullScreen()}
        data-tooltip="Fullscreen"
        data-placement="bottom"
      >
        <GiExpand aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const clickUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    handleUndo();
  };
  const handleUndo = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
  };
  useShortcut(DEFAULT_SHORTCUTS.UNDO, handleUndo);
  useShortcut(DEFAULT_SHORTCUTS.UNDOALT, handleUndo);
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Undo"
        onClick={clickUndo}
        title="Undo"
        data-tooltip="Undo"
        data-placement="bottom"
      >
        <FaUndo aria-hidden="true" fontSize={'1.5em'} />
      </button>
    </div>
  );
}

export default function Menu() {
  return (
    <div>
      <div className={styles.menuList}>
        <SkipAttackReactionsToggle />
        <SkipDefenseReactionsToggle />
      </div>
      <div className={styles.menuList}>
        <Skip1PowerAttacksToggle />
        <SkipAllAttacksToggle />
      </div>
    </div>
  );
}
