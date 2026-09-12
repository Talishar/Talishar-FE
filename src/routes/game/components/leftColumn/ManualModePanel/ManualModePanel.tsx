import React, { useState, useEffect } from 'react';
import styles from './ManualModePanel.module.css';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { submitButton, getGameInfo } from 'features/game/GameSlice';
import { updateOptions } from 'features/options/optionsSlice';
import { PROCESS_INPUT } from 'appConstants';
import { shallowEqual } from 'react-redux';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { RootState } from 'app/Store';
import { usePanelContext } from '../PanelContext';
import { useTranslation } from 'react-i18next';
import { usePlayerInputInProgress } from 'hooks/usePlayerInputInProgress';
import { useMediaQuery } from 'hooks/useMediaQuery';
import DeckOrganizer from '../../elements/deckOrganizer/DeckOrganizer';

export default function ManualModePanel() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobileOrTablet = useMediaQuery('(max-width: 1199px)');
  const {
    setIsManualModeOpen,
    isDevToolOpen,
    isManualModeOpen,
    isDeckOrganizerOpen,
    setIsDeckOrganizerOpen
  } = usePanelContext();
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';
  const isLocalEnvironment =
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost';
  const isPracticeDummy = useAppSelector(
    (state: RootState) => state.game.playerTwo.Name === 'Practice Dummy'
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const isOpponentAI = useAppSelector(
    (state: RootState) => state.game.gameInfo.isOpponentAI ?? false
  );

  useEffect(() => {
    if (isManualMode && !isMobileOrTablet) {
      setIsOpen(true);
    }
  }, [isManualMode, isMobileOrTablet]);

  useEffect(() => {
    setIsOpen(isManualModeOpen);
  }, [isManualModeOpen]);

  if (
    isReplay ||
    (!isLocalEnvironment && !isManualMode && !isPracticeDummy && !isOpponentAI)
  ) {
    return null;
  }

  return (
    <>
      {!isMobileOrTablet && (
        <button
          className={`${styles.manualModeTab} ${
            isOpen || isDevToolOpen ? styles.hidden : ''
          }`}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsManualModeOpen(!isOpen);
          }}
          title={t('MANUAL_MODE_PANEL.TOGGLE_MANUAL_MODE')}
        >
          {t('MANUAL_MODE_PANEL.TITLE')}
        </button>
      )}
      {isOpen && (
        <ManualModeContent
          onClose={() => {
            setIsOpen(false);
            setIsManualModeOpen(false);
          }}
          isPracticeDummy={isPracticeDummy}
          onOpenDeckOrganizer={() => setIsDeckOrganizerOpen(true)}
        />
      )}
      {isDeckOrganizerOpen && (
        <DeckOrganizer onClose={() => setIsDeckOrganizerOpen(false)} />
      )}
    </>
  );
}

function ManualCounter({
  label,
  value,
  addMode,
  subtractMode,
  addTitle,
  subtractTitle,
  inputTitle,
  disabled,
  onCommit
}: {
  label: string;
  value: number;
  addMode: number;
  subtractMode: number;
  addTitle: string;
  subtractTitle: string;
  inputTitle: string;
  disabled: boolean;
  onCommit: (mode: number, amount: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    const isRelative = trimmed.startsWith('+') || trimmed.startsWith('-');
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const delta = isRelative ? parsed : parsed - value;
    setDraft(String(value));
    if (delta === 0) return;
    onCommit(delta > 0 ? addMode : subtractMode, Math.abs(delta));
  };

  return (
    <div className={styles.controlGroup}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controlRow}>
        <button
          className={styles.buttonSmall}
          onClick={() => onCommit(subtractMode, 1)}
          title={subtractTitle}
          disabled={disabled}
        >
          <AiOutlineMinus />
        </button>
        <input
          className={styles.numberInput}
          type="text"
          inputMode="numeric"
          pattern="[+-]?[0-9]*"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          onKeyDownCapture={(event) => event.stopPropagation()}
          title={inputTitle}
          aria-label={label}
          disabled={disabled}
        />
        <button
          className={styles.buttonSmall}
          onClick={() => onCommit(addMode, 1)}
          title={addTitle}
          disabled={disabled}
        >
          <AiOutlinePlus />
        </button>
      </div>
    </div>
  );
}

function ManualModeContent({
  onClose,
  isPracticeDummy,
  onOpenDeckOrganizer
}: {
  onClose: () => void;
  isPracticeDummy: boolean;
  onOpenDeckOrganizer: () => void;
}) {
  const [cardInput, setCardInput] = useState('');
  const [drawCount, setDrawCount] = useState('1');
  const [weaponPowerInput, setWeaponPowerInput] = useState('4');
  const [isCardLoading, setIsCardLoading] = useState(false);
  const isRequestInProgress = usePlayerInputInProgress();
  const [showCardTooltip, setShowCardTooltip] = useState(false);
  const { t } = useTranslation();
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
    (state: RootState) => state.game.aiHasInfiniteHP ?? false
  );
  const practiceDummyWeaponPower = useAppSelector(
    (state: RootState) => state.game.practiceDummyWeaponPower ?? 4
  );

  useEffect(() => {
    setWeaponPowerInput(String(practiceDummyWeaponPower));
  }, [practiceDummyWeaponPower]);

  const parsedDrawCount = Math.max(
    1,
    Math.min(999, Number.parseInt(drawCount, 10) || 1)
  );

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
    if (isRequestInProgress) return;
    dispatch(
      submitButton({
        button: { mode }
      })
    );
  };

  const handleDispatchAmount = (mode: number, amount: number) => {
    if (isRequestInProgress) return;
    dispatch(
      submitButton({
        button: {
          mode,
          buttonInput: String(Math.max(1, Math.min(999, amount)))
        }
      })
    );
  };

  const handleDispatchWithParam = (mode: number, param: string | number) => {
    if (isRequestInProgress) return;
    dispatch(
      submitButton({
        button: {
          mode,
          ...(typeof param === 'string'
            ? { cardID: param.toLowerCase() }
            : { numMode: param })
        }
      })
    );
  };

  const handleAddCard = () => {
    if (cardInput === '' || isCardLoading) {
      return;
    }
    setIsCardLoading(true);
    handleDispatchWithParam(PROCESS_INPUT.ADD_CARD_TO_HAND_SELF, cardInput);
    setTimeout(() => setIsCardLoading(false), 300);
  };

  const handleWeaponPowerChange = () => {
    const parsedPower = Number.parseInt(weaponPowerInput, 10);
    const power = Number.isNaN(parsedPower)
      ? practiceDummyWeaponPower
      : Math.max(0, Math.min(100, parsedPower));
    setWeaponPowerInput(String(power));
    if (power !== practiceDummyWeaponPower) {
      handleDispatchWithParam(
        PROCESS_INPUT.SET_PRACTICE_DUMMY_WEAPON_POWER,
        power
      );
    }
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
        <h3>{t('MANUAL_MODE_PANEL.TITLE')}</h3>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={`Close ${t('MANUAL_MODE_PANEL.TITLE')}`}
        >
          <MdClose aria-hidden="true" />
        </button>
      </div>
      <div className={styles.content}>
        {/* AI Infinite HP Toggle - Only show against Practice Dummy */}
        {isPracticeDummy && (
          <>
            <div className={styles.toggleGroup}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={aiHasInfiniteHP}
                  onChange={() => {
                    if (!isRequestInProgress) {
                      handleDispatchWithParam(
                        PROCESS_INPUT.TOGGLE_AI_INFINITE_HP,
                        aiHasInfiniteHP ? 0 : 1
                      );
                    }
                  }}
                  className={styles.toggleCheckbox}
                  disabled={isRequestInProgress}
                />
                <span>{t('MANUAL_MODE_PANEL.AI_INFINITE_HP')}</span>
              </label>
            </div>
            <div className={styles.controlGroup}>
              <span className={styles.label}>
                {t('MANUAL_MODE_PANEL.WRENCH_POWER')}
              </span>
              <div className={styles.controlRow}>
                <button
                  className={styles.buttonSmall}
                  onClick={() =>
                    handleDispatchWithParam(
                      PROCESS_INPUT.SET_PRACTICE_DUMMY_WEAPON_POWER,
                      Math.max(0, practiceDummyWeaponPower - 1)
                    )
                  }
                  title={t('MANUAL_MODE_PANEL.REDUCE_WRENCH_POWER')}
                  disabled={
                    isRequestInProgress || practiceDummyWeaponPower <= 0
                  }
                >
                  <AiOutlineMinus />
                </button>
                <input
                  className={styles.numberInput}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={weaponPowerInput}
                  onChange={(event) => setWeaponPowerInput(event.target.value)}
                  onBlur={handleWeaponPowerChange}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }
                  }}
                  aria-label={t('MANUAL_MODE_PANEL.WRENCH_POWER_ARIA')}
                  disabled={isRequestInProgress}
                />
                <button
                  className={styles.buttonSmall}
                  onClick={() =>
                    handleDispatchWithParam(
                      PROCESS_INPUT.SET_PRACTICE_DUMMY_WEAPON_POWER,
                      Math.min(100, practiceDummyWeaponPower + 1)
                    )
                  }
                  title={t('MANUAL_MODE_PANEL.INCREASE_WRENCH_POWER')}
                  disabled={
                    isRequestInProgress || practiceDummyWeaponPower >= 100
                  }
                >
                  <AiOutlinePlus />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Player Life */}
        <ManualCounter
          label={t('MANUAL_MODE_PANEL.PLAYER_LIFE')}
          value={playerHealth ?? 0}
          addMode={PROCESS_INPUT.ADD_1_HP_SELF}
          subtractMode={PROCESS_INPUT.SUBTRACT_1_HP_SELF}
          addTitle={t('MANUAL_MODE_PANEL.ADD_1_HP_PLAYER')}
          subtractTitle={t('MANUAL_MODE_PANEL.REMOVE_1_HP_PLAYER')}
          inputTitle={t('MANUAL_MODE_PANEL.TYPE_A_VALUE')}
          disabled={isRequestInProgress}
          onCommit={handleDispatchAmount}
        />

        {/* Opponent Life */}
        <ManualCounter
          label={t('MANUAL_MODE_PANEL.OPPONENT_LIFE')}
          value={opponentHealth ?? 0}
          addMode={PROCESS_INPUT.ADD_1_HP_OPPONENT}
          subtractMode={PROCESS_INPUT.SUBTRACT_1_HP_OPPONENT}
          addTitle={t('MANUAL_MODE_PANEL.ADD_1_HP_OPPONENT')}
          subtractTitle={t('MANUAL_MODE_PANEL.REMOVE_1_HP_OPPONENT')}
          inputTitle={t('MANUAL_MODE_PANEL.TYPE_A_VALUE')}
          disabled={isRequestInProgress}
          onCommit={handleDispatchAmount}
        />

        {/* Player Action Points */}
        <ManualCounter
          label={t('MANUAL_MODE_PANEL.ACTION_POINTS')}
          value={playerActionPoints}
          addMode={PROCESS_INPUT.ADD_ACTION_POINT}
          subtractMode={PROCESS_INPUT.SUBTRACT_ACTION_POINT}
          addTitle={t('MANUAL_MODE_PANEL.ADD_1_ACTION_POINT')}
          subtractTitle={t('MANUAL_MODE_PANEL.REMOVE_1_ACTION_POINT')}
          inputTitle={t('MANUAL_MODE_PANEL.TYPE_A_VALUE')}
          disabled={isRequestInProgress}
          onCommit={handleDispatchAmount}
        />

        {/* Player Resources */}
        <ManualCounter
          label={t('MANUAL_MODE_PANEL.PLAYER_RESOURCES')}
          value={playerResources}
          addMode={PROCESS_INPUT.ADD_RESOURCE_TO_POOL_SELF}
          subtractMode={PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_SELF}
          addTitle={t('MANUAL_MODE_PANEL.ADD_1_RESOURCE_PLAYER')}
          subtractTitle={t('MANUAL_MODE_PANEL.REMOVE_1_RESOURCE_PLAYER')}
          inputTitle={t('MANUAL_MODE_PANEL.TYPE_A_VALUE')}
          disabled={isRequestInProgress}
          onCommit={handleDispatchAmount}
        />

        {/* Opponent Resources */}
        <ManualCounter
          label={t('MANUAL_MODE_PANEL.OPPONENT_RESOURCES')}
          value={opponentResources}
          addMode={PROCESS_INPUT.ADD_RESOURCE_TO_POOL_OPPONENT}
          subtractMode={PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_OPPONENT}
          addTitle={t('MANUAL_MODE_PANEL.ADD_1_RESOURCE_OPPONENT')}
          subtractTitle={t('MANUAL_MODE_PANEL.REMOVE_1_RESOURCE_OPPONENT')}
          inputTitle={t('MANUAL_MODE_PANEL.TYPE_A_VALUE')}
          disabled={isRequestInProgress}
          onCommit={handleDispatchAmount}
        />

        {/* Draw Card */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.CARDS_TO_DRAW')}
          </span>
          <div className={styles.controlRow}>
            <input
              className={styles.numberInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={drawCount}
              onChange={(event) => setDrawCount(event.target.value)}
              onBlur={() => setDrawCount(String(parsedDrawCount))}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
              onKeyDownCapture={(event) => event.stopPropagation()}
              aria-label={t('MANUAL_MODE_PANEL.CARDS_TO_DRAW')}
              disabled={isRequestInProgress}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.buttonFull}
              onClick={() =>
                handleDispatchAmount(
                  PROCESS_INPUT.DRAW_CARD_SELF,
                  parsedDrawCount
                )
              }
              title={t('MANUAL_MODE_PANEL.DRAW_CARD')}
              disabled={isRequestInProgress}
            >
              {t('MANUAL_MODE_PANEL.DRAW_CARD_PLAYER')}
            </button>
            <button
              className={styles.buttonFull}
              onClick={() =>
                handleDispatchAmount(
                  PROCESS_INPUT.DRAW_CARD_OPPONENT,
                  parsedDrawCount
                )
              }
              title={t('MANUAL_MODE_PANEL.DRAW_CARD_OPPONENT_TITLE')}
              disabled={isRequestInProgress}
            >
              {t('MANUAL_MODE_PANEL.DRAW_CARD_OPPONENT')}
            </button>
          </div>
        </div>

        {/* Add Card */}
        <div className={styles.formGroup}>
          <div className={styles.formLabelRow}>
            <label htmlFor="cardInput">{t('MANUAL_MODE_PANEL.ADD_CARD')}</label>
            <button
              className={styles.tooltipTrigger}
              onClick={() => setShowCardTooltip((v) => !v)}
              type="button"
              aria-label={t('MANUAL_MODE_PANEL.SHOW_CARD_INPUT_HELP')}
            >
              ?
            </button>
          </div>
          {showCardTooltip && (
            <div className={styles.tooltip}>
              <p className={styles.tooltipTitle}>
                {t('MANUAL_MODE_PANEL.INPUT_EXAMPLES_GUIDE')}
              </p>
              <ul className={styles.tooltipList}>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_IRONROT_GAUNTLET')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.EQUIPMENT_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_RUNECHANT')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.TOKEN_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_RUNECHANT_PIPE')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.TOKEN_PIPE_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_SNATCH_PIPE')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.CARD_PIPE_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_SNATCH_BLUE')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.COLOR_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_SNATCH_DECK')}
                  </span>
                  <span>{t('MANUAL_MODE_PANEL.DECK_DESCRIPTION')}</span>
                </li>
                <li>
                  <span className={styles.tooltipCode}>
                    {t('MANUAL_MODE_PANEL.CARD_SNATCH_PIPE_DECK')}
                  </span>
                  <span>
                    {t('MANUAL_MODE_PANEL.COUNT_DESTINATION_DESCRIPTION')}
                  </span>
                </li>
              </ul>
              <p className={styles.tooltipNote}>
                {t('MANUAL_MODE_PANEL.DESTINATION_NOTE')}
              </p>
            </div>
          )}
          <input
            id="cardInput"
            type="text"
            value={cardInput}
            onChange={(e) => setCardInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onKeyDownCapture={(e) => {
              e.stopPropagation();
            }}
            placeholder={t('MANUAL_MODE_PANEL.CARD_INPUT_PLACEHOLDER')}
            disabled={isCardLoading || isRequestInProgress}
          />
          <button
            className={styles.buttonFull}
            onClick={handleAddCard}
            disabled={isCardLoading || isRequestInProgress || cardInput === ''}
          >
            {isCardLoading
              ? t('MANUAL_MODE_PANEL.ADDING')
              : t('MANUAL_MODE_PANEL.ADD')}
          </button>
        </div>

        {/* Organize Deck */}
        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonFull}
            onClick={onOpenDeckOrganizer}
            title={t('MANUAL_MODE_PANEL.ORGANIZE_DECK')}
          >
            {t('MANUAL_MODE_PANEL.ORGANIZE_DECK')}
          </button>
        </div>

        {/* Remove Arsenal */}
        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonFull}
            onClick={() =>
              handleDispatch(PROCESS_INPUT.REMOVE_ARSENAL_FROM_SELF)
            }
            title={t('MANUAL_MODE_PANEL.REMOVE_ARSENAL_PLAYER_TITLE')}
            disabled={isRequestInProgress}
          >
            {t('MANUAL_MODE_PANEL.REMOVE_ARSENAL_PLAYER')}
          </button>
          <button
            className={styles.buttonFull}
            onClick={() =>
              handleDispatch(PROCESS_INPUT.REMOVE_ARSENAL_FROM_OPPONENT)
            }
            title={t('MANUAL_MODE_PANEL.REMOVE_ARSENAL_OPPONENT_TITLE')}
            disabled={isRequestInProgress}
          >
            {t('MANUAL_MODE_PANEL.REMOVE_ARSENAL_OPPONENT')}
          </button>
        </div>
      </div>
    </div>
  );
}
