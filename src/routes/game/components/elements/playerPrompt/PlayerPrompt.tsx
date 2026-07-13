import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Button from 'features/Button';
import { submitButton } from 'features/game/GameSlice';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import styles from './PlayerPrompt.module.css';
import { wrapKeywordsInNodes } from '../keywordPopover';

const DEBOUNCE_MS = 80;

const PlayerPrompt = React.memo(() => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const [displayedPrompt, setDisplayedPrompt] = useState(playerPrompt);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedPrompt(playerPrompt);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playerPrompt]);

  const dispatch = useAppDispatch();

  const helpTextElements = useMemo(
    () => wrapKeywordsInNodes(parseHtmlToReactElements(displayedPrompt?.helpText ?? '')),
    [displayedPrompt?.helpText]
  );

  const buttons = useMemo(
    () =>
      displayedPrompt?.buttons?.map((button: Button, ix: number) => (
        <div
          className={styles.buttonDiv}
          onClick={() => dispatch(submitButton({ button }))}
          key={`${button.mode ?? ix}-${button.caption ?? ix}`}
        >
          {button.caption}
        </div>
      )),
    [displayedPrompt?.buttons, dispatch]
  );

  return (
    <div className={styles.playerPrompt}>
      <div className={styles.content} key={displayedPrompt?.helpText}>
        <div>{helpTextElements}</div>
      </div>
      {buttons}
    </div>
  );
});

PlayerPrompt.displayName = 'PlayerPrompt';
export default PlayerPrompt;
