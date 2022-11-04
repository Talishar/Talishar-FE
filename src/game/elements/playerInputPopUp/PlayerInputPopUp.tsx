import React from 'react';
import { playCard, submitButton } from '../../../features/game/GameSlice';
import { useAppSelector, useAppDispatch } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from '../../../features/Button';

export default function PlayerInputPopUp() {
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );

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
      <div className={styles.contentContainer}>{buttons}</div>
    </div>
  );
}
