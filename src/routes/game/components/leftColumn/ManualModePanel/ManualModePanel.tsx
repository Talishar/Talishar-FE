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

export default function ManualModePanel() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { setIsManualModeOpen, isDevToolOpen, isManualModeOpen } =
    usePanelContext();
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

  useEffect(() => {
    if (isManualMode) {
      setIsOpen(true);
    }
  }, [isManualMode]);

  useEffect(() => {
    setIsOpen(isManualModeOpen);
  }, [isManualModeOpen]);

  // In local environment, always show the tab. In production, hide if manual mode is off (unless against Practice Dummy)
  if (isReplay || (!isLocalEnvironment && !isManualMode && !isPracticeDummy)) {
    return null;
  }

  return (
    <>
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
      {isOpen && (
        <ManualModeContent
          onClose={() => {
            setIsOpen(false);
            setIsManualModeOpen(false);
          }}
          isPracticeDummy={isPracticeDummy}
        />
      )}
    </>
  );
}

function ManualModeContent({
  onClose,
  isPracticeDummy
}: {
  onClose: () => void;
  isPracticeDummy: boolean;
}) {
  const [cardInput, setCardInput] = useState('');
  const [opponentHealthInput, setOpponentHealthInput] = useState('');
  const [weaponPowerInput, setWeaponPowerInput] = useState('4');
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
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
    if (isPracticeDummy) {
      setOpponentHealthInput(String(opponentHealth));
    }
  }, [opponentHealth, isPracticeDummy]);

  useEffect(() => {
    setWeaponPowerInput(String(practiceDummyWeaponPower));
  }, [practiceDummyWeaponPower]);

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
    setIsRequestInProgress(true);
    dispatch(
      submitButton({
        button: { mode }
      })
    ).finally(() => setIsRequestInProgress(false));
  };

  const handleDispatchWithParam = (mode: number, param: string | number) => {
    if (isRequestInProgress) return;
    setIsRequestInProgress(true);
    dispatch(
      submitButton({
        button: {
          mode,
          ...(typeof param === 'string'
            ? { cardID: param.toLowerCase() }
            : { numMode: param })
        }
      })
    ).finally(() => setIsRequestInProgress(false));
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
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.PLAYER_LIFE')}
          </span>
          <div className={styles.controlRow}>
            <button
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.SUBTRACT_1_HP_SELF)}
              title={t('MANUAL_MODE_PANEL.REMOVE_1_HP_PLAYER')}
              disabled={isRequestInProgress}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerHealth}</span>
            <button
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_1_HP_SELF)}
              title={t('MANUAL_MODE_PANEL.ADD_1_HP_PLAYER')}
              disabled={isRequestInProgress}
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Opponent Life */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.OPPONENT_LIFE')}
          </span>
          <div className={styles.controlRow}>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.SUBTRACT_1_HP_OPPONENT)
              }
              title={t('MANUAL_MODE_PANEL.REMOVE_1_HP_OPPONENT')}
              disabled={isRequestInProgress}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{opponentHealth}</span>
            <button
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_1_HP_OPPONENT)}
              title={t('MANUAL_MODE_PANEL.ADD_1_HP_OPPONENT')}
              disabled={isRequestInProgress}
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Player Action Points */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.ACTION_POINTS')}
          </span>
          <div className={styles.controlRow}>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.SUBTRACT_ACTION_POINT)
              }
              title={t('MANUAL_MODE_PANEL.REMOVE_1_ACTION_POINT')}
              disabled={isRequestInProgress}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerActionPoints}</span>
            <button
              className={styles.buttonSmall}
              onClick={() => handleDispatch(PROCESS_INPUT.ADD_ACTION_POINT)}
              title={t('MANUAL_MODE_PANEL.ADD_1_ACTION_POINT')}
              disabled={isRequestInProgress}
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Player Resources */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.PLAYER_RESOURCES')}
          </span>
          <div className={styles.controlRow}>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_SELF)
              }
              title={t('MANUAL_MODE_PANEL.REMOVE_1_RESOURCE_PLAYER')}
              disabled={isRequestInProgress}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{playerResources}</span>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.ADD_RESOURCE_TO_POOL_SELF)
              }
              title={t('MANUAL_MODE_PANEL.ADD_1_RESOURCE_PLAYER')}
              disabled={isRequestInProgress}
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>

        {/* Opponent Resources */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>
            {t('MANUAL_MODE_PANEL.OPPONENT_RESOURCES')}
          </span>
          <div className={styles.controlRow}>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_OPPONENT)
              }
              title={t('MANUAL_MODE_PANEL.REMOVE_1_RESOURCE_OPPONENT')}
              disabled={isRequestInProgress}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.value}>{opponentResources}</span>
            <button
              className={styles.buttonSmall}
              onClick={() =>
                handleDispatch(PROCESS_INPUT.ADD_RESOURCE_TO_POOL_OPPONENT)
              }
              title={t('MANUAL_MODE_PANEL.ADD_1_RESOURCE_OPPONENT')}
              disabled={isRequestInProgress}
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
            title={t('MANUAL_MODE_PANEL.DRAW_CARD')}
            disabled={isRequestInProgress}
          >
            {t('MANUAL_MODE_PANEL.DRAW_CARD_PLAYER')}
          </button>
          <button
            className={styles.buttonFull}
            onClick={() => handleDispatch(PROCESS_INPUT.DRAW_CARD_OPPONENT)}
            title={t('MANUAL_MODE_PANEL.DRAW_CARD_OPPONENT_TITLE')}
            disabled={isRequestInProgress}
          >
            {t('MANUAL_MODE_PANEL.DRAW_CARD_OPPONENT')}
          </button>
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
