import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Button from 'features/Button';
import { submitButton } from 'features/game/GameSlice';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import styles from './PlayerPrompt.module.css';

const PlayerPrompt = React.memo(() => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const dispatch = useAppDispatch();

  const helpTextElements = useMemo(
    () => parseHtmlToReactElements(playerPrompt?.helpText ?? ''),
    [playerPrompt?.helpText]
  );

  const buttons = useMemo(
    () =>
      playerPrompt?.buttons?.map((button: Button, ix: number) => (
        <div
          className={styles.buttonDiv}
          onClick={() => dispatch(submitButton({ button }))}
          key={ix.toString()}
        >
          {button.caption}
        </div>
      )),
    [playerPrompt?.buttons, dispatch]
  );

  return (
    <div className={styles.playerPrompt}>
      <div className={styles.content}>
        <div>{helpTextElements}</div>
      </div>
      {buttons}
    </div>
  );
});

PlayerPrompt.displayName = 'PlayerPrompt';
export default PlayerPrompt;
