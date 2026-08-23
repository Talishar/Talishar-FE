import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { PROCESS_INPUT, UNDO_REASONS } from 'appConstants';
import { dismissUndoReasonPrompt, submitButton } from 'features/game/GameSlice';
import styles from './UndoReasonPrompt.module.css';

const UndoReasonPrompt = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isActive = useAppSelector(
    (state: RootState) => state.game.undoReasonPrompt?.active === true
  );

  const sendReason = useCallback(
    (reasonCode: number) => {
      dispatch(dismissUndoReasonPrompt());
      dispatch(
        submitButton({
          button: {
            mode: PROCESS_INPUT.UNDO_REASON,
            inputText: String(reasonCode)
          }
        })
      );
    },
    [dispatch]
  );

  const skip = useCallback(() => {
    dispatch(dismissUndoReasonPrompt());
  }, [dispatch]);

  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        skip();
        return;
      }
      const index = parseInt(event.key) - 1;
      if (index === UNDO_REASONS.length) {
        event.preventDefault();
        skip();
        return;
      }
      if (index >= 0 && index < UNDO_REASONS.length) {
        event.preventDefault();
        sendReason(UNDO_REASONS[index].code);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, skip, sendReason]);

  if (!isActive) return null;

  return createPortal(
    <dialog open className={styles.modal}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{t('UNDO_REASON.TITLE')}</div>
          <div className={styles.subtitle}>{t('UNDO_REASON.SUBTITLE')}</div>
        </div>
        <div className={styles.reasonList}>
          {UNDO_REASONS.map((reason, index) => (
            <button
              key={reason.code}
              className={styles.reasonButton}
              onClick={(e) => {
                e.preventDefault();
                sendReason(reason.code);
              }}
            >
              <span className={styles.reasonKey}>{index + 1}</span>
              {t(reason.key)}
            </button>
          ))}
        </div>
        <div className={styles.footer}>
          <button
            className={`${styles.reasonButton} ${styles.skipButton}`}
            onClick={(e) => {
              e.preventDefault();
              skip();
            }}
          >
            <span className={styles.reasonKey}>{UNDO_REASONS.length + 1}</span>
            {t('UNDO_REASON.SKIP')}
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
});

UndoReasonPrompt.displayName = 'UndoReasonPrompt';
export default UndoReasonPrompt;
