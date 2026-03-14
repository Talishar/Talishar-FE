import React, { useEffect, useState, useRef } from 'react';
import { submitButton, submitMultiButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from 'features/Button';
import { FaTimes } from 'react-icons/fa';
import { MdDragHandle } from 'react-icons/md';
import { PROCESS_INPUT } from 'appConstants';
import { motion } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { OptInput } from './components/OptInput';
import { NewOptInput } from './components/NewOptInput';
import { TriggerOrderInput } from './components/TriggerOrderInput';
import { FormProps } from './playerInputPopupTypes';
import { OtherInput } from './components/OtherInput';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';

const PlayerInputFormTypeMap: {
  [key: string]: (props: FormProps) => JSX.Element;
} = {
  OPT: OptInput,
  NEWOPT: NewOptInput,
  HANDTOPBOTTOM: OptInput,
  TRIGGERORDER: TriggerOrderInput
};

const PLAYER_INPUT_STORAGE_KEY = 'playerInputPopupPosition';
const PLAYER_INPUT_MAX_Y_OFFSET = 30;
const PLAYER_INPUT_MIN_Y_OFFSET = -45;

export default function PlayerInputPopUp() {
  const showModal = useShowModal();
  const dispatch = useAppDispatch();
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );

  const [checkedState, setCheckedState] = useState(
    new Array(inputPopUp?.multiChooseText?.length).fill(false)
  );

  const [yOffset, setYOffset] = useState(() => {
    const stored = localStorage.getItem(PLAYER_INPUT_STORAGE_KEY);
    return stored ? parseFloat(stored) : 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartOffset(yOffset);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartOffset(yOffset);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;
      newOffset = Math.max(
        PLAYER_INPUT_MIN_Y_OFFSET,
        Math.min(PLAYER_INPUT_MAX_Y_OFFSET, newOffset)
      );
      setYOffset(newOffset);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;
      newOffset = Math.max(
        PLAYER_INPUT_MIN_Y_OFFSET,
        Math.min(PLAYER_INPUT_MAX_Y_OFFSET, newOffset)
      );
      setYOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem(PLAYER_INPUT_STORAGE_KEY, yOffset.toString());
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem(PLAYER_INPUT_STORAGE_KEY, yOffset.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, dragStartOffset, yOffset]);

  useEffect(() => {
    const cardsArrLength = inputPopUp?.popup?.cards?.length ?? 0;
    const optionsArrLength = inputPopUp?.multiChooseText?.length ?? 0;
    const checkBoxLength = Math.max(cardsArrLength, optionsArrLength);

    // Initialize checked state from multiChooseText default values
    const initialState = new Array(checkBoxLength).fill(false);
    if (inputPopUp?.multiChooseText) {
      inputPopUp.multiChooseText.forEach((option, index) => {
        if (option.check !== undefined) {
          initialState[index] = option.check;
        }
      });
    }

    setCheckedState(initialState);
  }, [inputPopUp]);

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const onClickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  if (
    !showModal ||
    inputPopUp === undefined ||
    inputPopUp.active === undefined ||
    inputPopUp.active == false
  ) {
    return null;
  }

  const checkBoxSubmit = () => {
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
    const updatedCheckedState = checkedState.map((item, index) =>
      index === pos ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const checkboxes =
    inputPopUp.multiChooseText?.map((option, ix) => {
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

  const FormDisplay =
    PlayerInputFormTypeMap[inputPopUp.popup?.id || ''] || OtherInput;

  const titleElements = parseHtmlToReactElements(
    inputPopUp?.popup?.title ?? ''
  );

  const basePct = inputPopUp.popup?.id === 'NEWOPT' ? '40%' : '52.5%';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'tween' }}
      style={{ top: `calc(${basePct} + ${yOffset}dvh)` }}
      key="playerInputPopupBox"
      className={
        inputPopUp.popup?.id === 'NEWOPT'
          ? styles.optOptionsContainer
          : styles.optionsContainer
      }
    >
      <div className={styles.popupContent}>
        <div className={styles.optionsTitleContainer}>
          <div className={styles.optionsTitle}>
            <h3 className={styles.title}>{titleElements}</h3>
            <h4 className={styles.subtitle}>
              {inputPopUp.popup?.additionalComments}
            </h4>
          </div>
          {inputPopUp.popup?.canClose ? (
            <div className={styles.inputPopUpCloseIcon} onClick={onPassTurn}>
              <FaTimes title="Close Popup" />
            </div>
          ) : null}
        </div>
        <div className={styles.contentContainer}>
          <FormDisplay
            cards={inputPopUp.popup?.cards || []}
            topCards={inputPopUp.popup?.topCards || []}
            bottomCards={inputPopUp.popup?.bottomCards || []}
            buttons={inputPopUp.buttons || []}
            onClickButton={onClickButton}
            id={inputPopUp.popup?.id || ''}
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
          aria-label="Drag to move popup"
        />
      </div>
    </motion.div>
  );
}
