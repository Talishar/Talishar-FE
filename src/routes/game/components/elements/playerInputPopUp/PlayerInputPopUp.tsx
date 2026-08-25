import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { submitButton, submitMultiButton } from 'features/game/GameSlice';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from 'features/Button';
import { FaTimes } from 'react-icons/fa';
import { MdDragHandle } from 'react-icons/md';
import { PROCESS_INPUT } from 'appConstants';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { OptInput } from './components/OptInput';
import { NewOptInput } from './components/NewOptInput';
import { TriggerOrderInput } from './components/TriggerOrderInput';
import { RearrangeTopInput } from './components/RearrangeTopInput';
import { NumberInput } from './components/NumberInput';
import { FormProps } from './playerInputPopupTypes';
import { OtherInput } from './components/OtherInput';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import classNames from 'classnames';
import GameState from 'features/GameState';
import { Card } from 'features/Card';

type MultiChooseOption = NonNullable<
  NonNullable<GameState['playerInputPopUp']>['multiChooseText']
>[number];

const PlayerInputFormTypeMap: {
  [key: string]: (props: FormProps) => JSX.Element;
} = {
  OPT: OptInput,
  NEWOPT: NewOptInput,
  HANDTOPBOTTOM: OptInput,
  TRIGGERORDER: TriggerOrderInput,
  REARRANGETOP: RearrangeTopInput,
  NUMBERINPUT: NumberInput
};

const PLAYER_INPUT_STORAGE_KEY = 'playerInputPopupPosition';
const PLAYER_INPUT_MAX_Y_OFFSET = 30;
const PLAYER_INPUT_MIN_Y_OFFSET = -45;

export default function PlayerInputPopUp() {
  const showModal = useShowModal();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );
  const hasGameEnded = useAppSelector(
    (state: RootState) => state.game.hasGameEnded
  );

  const [checkedState, setCheckedState] = useState(
    new Array(inputPopUp?.multiChooseText?.length).fill(false)
  );
  const [cardSearch, setCardSearch] = useState('');

  const storedInputOffset =
    parseFloat(localStorage.getItem(PLAYER_INPUT_STORAGE_KEY) ?? '') || 0;
  const yOffsetMV = useMotionValue(storedInputOffset);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(storedInputOffset);
  const currentDragOffsetRef = useRef(storedInputOffset);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const basePctRef = useRef('52.5%');

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = currentDragOffsetRef.current;
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      dragStartYRef.current = e.touches[0].clientY;
      dragStartOffsetRef.current = currentDragOffsetRef.current;
      setIsDragging(true);
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.clientY - dragStartYRef.current;
        const deltaDvh = (delta / window.innerHeight) * 100;
        const newOffset = Math.max(
          PLAYER_INPUT_MIN_Y_OFFSET,
          Math.min(
            PLAYER_INPUT_MAX_Y_OFFSET,
            dragStartOffsetRef.current + deltaDvh
          )
        );
        currentDragOffsetRef.current = newOffset;
        yOffsetMV.set(newOffset); // direct DOM update - no React re-render
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.touches[0].clientY - dragStartYRef.current;
        const deltaDvh = (delta / window.innerHeight) * 100;
        const newOffset = Math.max(
          PLAYER_INPUT_MIN_Y_OFFSET,
          Math.min(
            PLAYER_INPUT_MAX_Y_OFFSET,
            dragStartOffsetRef.current + deltaDvh
          )
        );
        currentDragOffsetRef.current = newOffset;
        yOffsetMV.set(newOffset); // direct DOM update - no React re-render
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      localStorage.setItem(
        PLAYER_INPUT_STORAGE_KEY,
        currentDragOffsetRef.current.toString()
      );
    };

    const handleTouchEnd = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      localStorage.setItem(
        PLAYER_INPUT_STORAGE_KEY,
        currentDragOffsetRef.current.toString()
      );
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, yOffsetMV]);

  useEffect(() => {
    const cardsArrLength = inputPopUp?.popup?.cards?.length ?? 0;
    const optionsArrLength = inputPopUp?.multiChooseText?.length ?? 0;
    const checkBoxLength = Math.max(cardsArrLength, optionsArrLength);

    // Initialize checked state from multiChooseText default values
    const initialState = new Array(checkBoxLength).fill(false);
    if (inputPopUp?.multiChooseText) {
      inputPopUp.multiChooseText.forEach(
        (option: MultiChooseOption, index: number) => {
          if (option.check !== undefined) {
            initialState[index] = option.check;
          }
        }
      );
    }

    setCheckedState(initialState);
  }, [inputPopUp]);

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const onClickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const basePct = inputPopUp?.popup?.id === 'NEWOPT' ? '40%' : '52.5%';
  basePctRef.current = basePct;
  const topStyle = useTransform(
    yOffsetMV,
    (v) => `calc(${basePctRef.current} + ${v}dvh)`
  );
  const popupId = inputPopUp?.popup?.id || '';
  const popupCards = inputPopUp?.popup?.cards;
  const usesOtherInput = !PlayerInputFormTypeMap[popupId];
  const popupCardCount = popupCards?.length ?? 0;
  const showCardSearch = usesOtherInput && popupCardCount >= 8;
  const { cardListKey, normalizedCardText } = useMemo(() => {
    let nextCardListKey = '';
    const nextNormalizedCardText: string[] = [];
    const cards = popupCards ?? [];

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      if (index > 0) nextCardListKey += '|';
      nextCardListKey += `${card.cardNumber}:${card.actionDataOverride ?? ''}`;
      nextNormalizedCardText.push(
        `${card.cardName ?? ''} ${card.cardNumber}`.toLocaleLowerCase()
      );
    }

    return {
      cardListKey: nextCardListKey,
      normalizedCardText: nextNormalizedCardText
    };
  }, [popupCards]);
  const filteredCardEntries = useMemo(() => {
    const cards: Card[] = [];
    const originalIndexes: number[] = [];
    if (!popupCards) return { cards, originalIndexes };

    const normalizedSearch = showCardSearch
      ? cardSearch.trim().toLocaleLowerCase()
      : '';
    for (
      let originalIndex = 0;
      originalIndex < popupCards.length;
      originalIndex += 1
    ) {
      const card = popupCards[originalIndex];
      if (
        normalizedSearch &&
        !normalizedCardText[originalIndex].includes(normalizedSearch)
      ) {
        continue;
      }
      cards.push(card);
      originalIndexes.push(originalIndex);
    }

    return { cards, originalIndexes };
  }, [popupCards, normalizedCardText, cardSearch, showCardSearch]);

  useEffect(() => {
    setCardSearch('');
  }, [cardListKey]);

  if (
    !showModal ||
    inputPopUp === undefined ||
    inputPopUp.active === undefined ||
    inputPopUp.active == false
  ) {
    return null;
  }

  const checkBoxSubmit = () => {
    let selectedCount = 0;
    for (const checked of checkedState) {
      if (checked) ++selectedCount;
    }
    const minNo = inputPopUp.formOptions?.minNo ?? 0;
    const maxNo = inputPopUp.formOptions?.maxNo ?? checkedState.length;
    if (selectedCount < minNo || selectedCount > maxNo) {
      return;
    }

    let extraParams = `&chkCount=${checkedState.length}`;
    if (inputPopUp.multiChooseText) {
      for (let i = 0; i < checkedState.length; i++) {
        if (inputPopUp.multiChooseText[i]) {
          extraParams += checkedState[i]
            ? `&chk${i}=${inputPopUp.multiChooseText[i].value}`
            : '';
        }
      }
    }
    if (inputPopUp.popup?.cards) {
      for (let i = 0; i < checkedState.length; i++) {
        if (inputPopUp.popup.cards[i]) {
          extraParams += checkedState[i]
            ? `&chk${i}=${inputPopUp.popup.cards[i].actionDataOverride}`
            : '';
        }
      }
    }
    dispatch(
      submitMultiButton({
        mode: inputPopUp.formOptions?.mode,
        extraParams: extraParams
      })
    );
  };

  const handleCheckBoxChange = (pos: number | undefined) => {
    if (pos === undefined) {
      return;
    }
    const maxNo = inputPopUp.formOptions?.maxNo ?? checkedState.length;
    let selectedCount = 0;
    for (const checked of checkedState) {
      if (checked) ++selectedCount;
    }
    if (!checkedState[pos] && selectedCount >= maxNo) {
      return;
    }
    const updatedCheckedState = checkedState.map((item, index) =>
      index === pos ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const checkboxes =
    inputPopUp.multiChooseText?.map((option: MultiChooseOption, ix: number) => {
      return (
        <div key={ix} className={styles.checkBoxRow}>
          <label className={styles.checkBoxLabel}>
            <input
              type="checkbox"
              id={`multi-choose-text-${String(option.input)}`}
              name={option.label}
              checked={checkedState[ix]}
              onChange={() => handleCheckBoxChange(option.input)}
              className={styles.checkBox}
            />
            {option.label}
          </label>
        </div>
      );
    }) || [];

  const FormDisplay = PlayerInputFormTypeMap[popupId] || OtherInput;

  const titleElements = parseHtmlToReactElements(
    inputPopUp?.popup?.title ?? ''
  );

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'tween', duration: 0.12 }}
      style={{ top: topStyle }}
      key="playerInputPopupBox"
      className={classNames(
        inputPopUp.popup?.id === 'NEWOPT'
          ? styles.optOptionsContainer
          : styles.optionsContainer,
        { [styles.aboveEndGameScreen]: hasGameEnded }
      )}
    >
      <div className={styles.popupContent}>
        <div className={styles.optionsTitleContainer}>
          <div className={styles.optionsTitle}>
            <h3 className={styles.title}>{titleElements}</h3>
            <h4 className={styles.subtitle}>
              {inputPopUp.popup?.additionalComments}
            </h4>
          </div>
          {showCardSearch ? (
            <div className={styles.cardSearchContainer}>
              <input
                type="search"
                className={styles.cardSearchInput}
                value={cardSearch}
                onChange={(event) => setCardSearch(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder={t('PLAYER_INPUT.SEARCH_CARDS')}
                aria-label={t('PLAYER_INPUT.SEARCH_CARDS')}
              />
              {cardSearch ? (
                <span className={styles.cardSearchCount} aria-live="polite">
                  {filteredCardEntries.cards.length} {t('PLAYER_INPUT.OF')}{' '}
                  {popupCardCount}
                </span>
              ) : null}
            </div>
          ) : null}
          {inputPopUp.popup?.canClose ? (
            <button
              type="button"
              className={styles.inputPopUpCloseIcon}
              onClick={onPassTurn}
              aria-label={t('PLAYER_INPUT.CLOSE_POPUP')}
            >
              <FaTimes aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className={styles.contentContainer}>
          {showCardSearch &&
          cardSearch &&
          filteredCardEntries.cards.length === 0 ? (
            <div className={styles.noSearchResults} role="status">
              {t('PLAYER_INPUT.NO_MATCHING_CARDS')}
            </div>
          ) : null}
          <FormDisplay
            cards={filteredCardEntries.cards}
            cardOriginalIndexes={filteredCardEntries.originalIndexes}
            topCards={inputPopUp.popup?.topCards || []}
            bottomCards={inputPopUp.popup?.bottomCards || []}
            buttons={inputPopUp.buttons || []}
            onClickButton={onClickButton}
            id={inputPopUp.popup?.id || ''}
            customInput={inputPopUp.popup?.customInput || ''}
            choiceOptions={inputPopUp.choiceOptions || ''}
            checkedState={checkedState}
            handleCheckBoxChange={handleCheckBoxChange}
            formOptions={inputPopUp.formOptions}
            checkboxes={checkboxes}
            checkBoxSubmit={checkBoxSubmit}
          />
        </div>
      </div>
      <div
        className={`${styles.grabbyHandle} ${
          isDragging ? styles.grabbyHandleDragging : ''
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <MdDragHandle
          size={32}
          className={styles.gripIcon}
          aria-label={t('PLAYER_INPUT.DRAG_MOVE_POPUP')}
        />
      </div>
    </motion.div>
  );
}
