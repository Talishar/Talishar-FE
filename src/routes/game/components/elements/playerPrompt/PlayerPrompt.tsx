import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Button from 'features/Button';
import { submitButton } from 'features/game/GameSlice';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import styles from './PlayerPrompt.module.css';

const PlayerPrompt = () => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const dispatch = useAppDispatch();

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const buttons = playerPrompt?.buttons?.map((button, ix) => {
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
    <div className={styles.playerPrompt}>
      <div className={styles.content}>
        <div>
          {parseHtmlToReactElements(playerPrompt?.helpText ?? '')}
        </div>
      </div>
      {buttons}
    </div>
  );
};

export default PlayerPrompt;
