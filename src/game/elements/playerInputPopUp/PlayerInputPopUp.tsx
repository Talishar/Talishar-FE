import React, { useEffect, useState } from 'react';
import {
  submitButton,
  submitMultiButton
} from '../../../features/game/GameSlice';
import { useAppSelector, useAppDispatch } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from '../../../features/Button';
import CardDisplay from '../cardDisplay/CardDisplay';

export default function PlayerInputPopUp() {
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );

  const [checkedState, setCheckedState] = useState(
    new Array(inputPopUp?.multiChooseText?.length).fill(false)
  );

  useEffect(() => {
    setCheckedState(new Array(inputPopUp?.multiChooseText?.length).fill(false));
  }, [inputPopUp]);

  const dispatch = useAppDispatch();

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: 99 } }));
  };

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  if (
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
          if (inputPopUp.multiChooseText[i].value) {
            extraParams += checkedState[i]
              ? `&chk${i}=${inputPopUp.multiChooseText[i].value}`
              : '';
          }
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

  const buttons = inputPopUp.buttons?.map((button, ix) => {
    return (
      <div
        className={styles.buttonDiv}
        onClick={() => {
          clickButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </div>
    );
  });

  const selectCard = inputPopUp.popup?.cards?.map((card, ix) => {
    return (
      <div className={styles.cardDiv} key={ix.toString()}>
        <CardDisplay card={card} />
      </div>
    );
  });

  const handleCheckBoxChange = (pos: number | undefined) => {
    if (pos === undefined) {
      return;
    }
    const updatedCheckedState = checkedState.map((item, index) =>
      index === pos ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const checkboxes = inputPopUp.multiChooseText?.map((option, ix) => {
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
  });

  return (
    <div className={styles.optionsContainer}>
      <div className={styles.optionsTitleContainer}>
        <div className={styles.optionsTitle}>
          <h3 className={styles.title}>{inputPopUp.popup?.title}</h3>
          {inputPopUp.popup?.additionalComments}
        </div>
        {inputPopUp.popup?.canClose ? (
          <div className={styles.inputPopUpCloseIcon} onClick={onPassTurn}>
            <div>
              <h3 className={styles.title}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </h3>
            </div>
          </div>
        ) : null}
      </div>
      <div className={styles.contentContainer}>
        {selectCard}
        {buttons}
        {inputPopUp.formOptions ? (
          <form>
            {checkboxes}
            <div
              className={styles.buttonDiv}
              onClick={() => {
                checkBoxSubmit();
              }}
            >
              {inputPopUp.formOptions.caption}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
