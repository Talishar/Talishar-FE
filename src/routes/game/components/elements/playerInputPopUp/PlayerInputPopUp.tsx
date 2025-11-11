import React, { useEffect, useState } from 'react';
import { submitButton, submitMultiButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from 'features/Button';
import { FaTimes } from 'react-icons/fa';
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

export default function PlayerInputPopUp() {
  const showModal = useShowModal();
  const dispatch = useAppDispatch();
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );

  const [checkedState, setCheckedState] = useState(
    new Array(inputPopUp?.multiChooseText?.length).fill(false)
  );

  useEffect(() => {
    const cardsArrLength = inputPopUp?.popup?.cards?.length ?? 0;
    const optionsArrLength = inputPopUp?.multiChooseText?.length ?? 0;
    const checkBoxLength = Math.max(cardsArrLength, optionsArrLength);
    setCheckedState(new Array(checkBoxLength).fill(false));
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
              value={checkedState[ix]}
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
  
  const titleElements = parseHtmlToReactElements(inputPopUp?.popup?.title ?? '');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      key="playerInputPopupBox"
      className={
        inputPopUp.popup?.id === 'NEWOPT'
          ? styles.optOptionsContainer
          : styles.optionsContainer
      }
    >
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
    </motion.div>
  );
}
