import React, { useState, useId, useEffect } from 'react';
import styles from './ManualModePanel.module.css';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { submitButton, getGameInfo } from 'features/game/GameSlice';
import { updateOptions } from 'features/options/optionsSlice';
import { PROCESS_INPUT } from 'appConstants';
import { shallowEqual } from 'react-redux';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { RootState } from 'app/Store';
import { usePanelContext } from '../PanelContext';

export default function ManualModePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { setIsManualModeOpen, isDevToolOpen } = usePanelContext();
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';
  const isLocalEnvironment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  const isPracticeDummy = useAppSelector(
    (state: RootState) => state.game.playerTwo.Name === 'Practice Dummy'
  );

  useEffect(() => {
    if (isManualMode || isPracticeDummy) {
      setIsOpen(true);
    }
  }, [isManualMode, isPracticeDummy]);

  // In local environment, always show the tab. In production, hide if manual mode is off (unless against Practice Dummy)
  if (!isLocalEnvironment && !isManualMode && !isPracticeDummy) {
    return null;
  }

  return (
    <>
      <button 
        className={`${styles.manualModeTab} ${isOpen || isDevToolOpen ? styles.hidden : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsManualModeOpen(!isOpen);
        }}
        title="Toggle Manual Mode"
      >
        Manual Mode
      </button>
      {isOpen && <ManualModeContent onClose={() => {
        setIsOpen(false);
        setIsManualModeOpen(false);
      }} isPracticeDummy={isPracticeDummy} />}
    </>
  );
}

function ManualModeContent({ onClose, isPracticeDummy }: { onClose: () => void; isPracticeDummy: boolean }) {
  const [cardInput, setCardInput] = useState('');
  const [opponentHealthInput, setOpponentHealthInput] = useState('');
  const [isCardLoading, setIsCardLoading] = useState(false);
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const playerHealth = useAppSelector(
    (state: RootState) => state.game.playerOne.Health
  );
  const opponentHealth = useAppSelector(
    (state: RootState) => state.game.playerTwo.Health
  );
  const playerActionPoints = useAppSelector(
    (state: RootState) => state.game.playerOne.ActionPoints ?? 0
  );
  const playerResources = useAppSelector(
    (state: RootState) => state.game.playerOne.PitchRemaining ?? 0
  );
  const opponentResources = useAppSelector(
    (state: RootState) => state.game.playerTwo.PitchRemaining ?? 0
  );
  const aiHasInfiniteHP = useAppSelector(
    (state: RootState) => (state.game as any).aiHasInfiniteHP ?? false
  );

  useEffect(() => {
    if (isPracticeDummy) {
      setOpponentHealthInput(String(opponentHealth));
    }
  }, [opponentHealth, isPracticeDummy]);

  const handleClose = () => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          {
            name: MANUAL_MODE,
            value: '0'
          }
        ]
      })
    );
    onClose();
  };

  const handleDispatch = (mode: number) => {
    dispatch(
      submitButton({
        button: { mode }
      })
    );
  };

  const handleDispatchWithParam = (mode: number, param: string | number) => {
    dispatch(
      submitButton({
        button: { mode, ...(typeof param === 'string' ? { cardID: param.toLowerCase() } : { numMode: param }) }
      })
    );
  };

  const handleAddCard = () => {
    if (cardInput === '' || isCardLoading) {
      return;
    }
    setIsCardLoading(true);
    handleDispatchWithParam(PROCESS_INPUT.ADD_CARD_TO_HAND_SELF, cardInput);
    setCardInput('');
    setTimeout(() => setIsCardLoading(false), 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleAddCard();
    }
  };

  return (
    <div className={styles.manualModePanel}>
      <div className={styles.header}>
        <h3>Manual Mode</h3>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        {/* AI Infinite HP Toggle - Only show against Practice Dummy */}
        {isPracticeDummy && (
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={aiHasInfiniteHP}
                onChange={() => {
                  handleDispatchWithParam(PROCESS_INPUT.TOGGLE_AI_INFINITE_HP, aiHasInfiniteHP ? 0 : 1);
                }}
                className={styles.toggleCheckbox}
              />
              <span>AI Infinite HP</span>
            </label>
          </div>
        )}

        {/* Player Life */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Player Life</span>
          <div className={styles.controlRow}>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.SUBTRACT_1_HP_SELF)}
              title="Remove 1 HP from player"
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerHealth}</span>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_1_HP_SELF)}
              title="Add 1 HP to player"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Opponent Life */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Opponent Life</span>
          <div className={styles.controlRow}>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.SUBTRACT_1_HP_OPPONENT)}
              title="Remove 1 HP from opponent"
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{opponentHealth}</span>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_1_HP_OPPONENT)}
              title="Add 1 HP to opponent"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Player Action Points */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Action Points</span>
          <div className={styles.controlRow}>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.SUBTRACT_ACTION_POINT)}
              title="Remove 1 Action Point"
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerActionPoints}</span>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_ACTION_POINT)}
              title="Add 1 Action Point"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Player Resources */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Player Resources</span>
          <div className={styles.controlRow}>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_SELF)}
              title="Remove 1 resource from player pool"
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerResources}</span>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_RESOURCE_TO_POOL_SELF)}
              title="Add 1 resource to player pool"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Opponent Resources */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Opponent Resources</span>
          <div className={styles.controlRow}>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_OPPONENT)}
              title="Remove 1 resource from opponent pool"
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{opponentResources}</span>
            <button 
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_RESOURCE_TO_POOL_OPPONENT)}
              title="Add 1 resource to opponent pool"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Draw Card */}
        <div className={styles.buttonGroup}>
          <button 
            className={styles.buttonFull}
            onClick={() => handleDispatch(PROCESS_INPUT.DRAW_CARD_SELF)}
            title="Draw a card"
          >
            Draw Card (Player)
          </button>
          <button 
            className={styles.buttonFull}
            onClick={() => handleDispatch(PROCESS_INPUT.DRAW_CARD_OPPONENT)}
            title="Draw a card for opponent"
          >
            Draw Card (Opponent)
          </button>
        </div>

        {/* Add Card to Hand */}
        <div className={styles.formGroup}>
          <label htmlFor="cardInput">Add Card to Hand</label>
          <input
            id="cardInput"
            type="text"
            value={cardInput}
            onChange={(e) => setCardInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onKeyDownCapture={(e) => {
              e.stopPropagation();
            }}
            placeholder="Enter card ID"
            disabled={isCardLoading}
          />
          <button 
            className={styles.buttonFull}
            onClick={handleAddCard}
            disabled={isCardLoading || cardInput === ''}
          >
            {isCardLoading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Remove Arsenal */}
        <div className={styles.buttonGroup}>
          <button 
            className={styles.buttonFull}
            onClick={() => handleDispatch(PROCESS_INPUT.REMOVE_ARSENAL_FROM_SELF)}
            title="Remove arsenal from player"
          >
            Remove Arsenal (Player)
          </button>
          <button 
            className={styles.buttonFull}
            onClick={() => handleDispatch(PROCESS_INPUT.REMOVE_ARSENAL_FROM_OPPONENT)}
            title="Remove arsenal from opponent"
          >
            Remove Arsenal (Opponent)
          </button>
        </div>
      </div>
    </div>
  );
}
