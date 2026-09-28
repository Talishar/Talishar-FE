import React, { lazy, Suspense, useEffect, useState } from 'react';
import Button from 'features/Button';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { NAME_A_CARD } from '../constants';
import { FormProps } from '../playerInputPopupTypes';
import { promptShortcutKey, shortcutBlockedByFocus } from '../promptShortcuts';
import styles from '../PlayerInputPopUp.module.css';
import { SplitButton } from './SplitButton';

const SearchCardInput = lazy(
  () => import('../../searchCardInput/SearchCardInput')
);

const groupButtons = (buttons: Button[]): (Button | Button[])[] => {
  const entries: (Button | Button[])[] = [];
  for (const button of buttons) {
    const previous = entries[entries.length - 1];
    if (
      button.group &&
      Array.isArray(previous) &&
      previous[0].group === button.group
    ) {
      previous.push(button);
    } else {
      entries.push(button.group ? [button] : button);
    }
  }
  return entries;
};

export const OtherInput = (props: FormProps) => {
  const {
    cards,
    cardOriginalIndexes,
    cardCounts,
    buttons,
    choiceOptions,
    checkedState,
    handleCheckBoxChange,
    onClickButton,
    id,
    formOptions,
    checkboxes,
    checkBoxSubmit
  } = props;

  const [hint, setHint] = useState<string>();
  const hints = [
    ...new Set(
      (buttons ?? []).flatMap((button) =>
        button.tooltip ? [button.tooltip] : []
      )
    )
  ];

  useEffect(() => {
    setHint(undefined);
  }, [buttons]);

  useEffect(() => {
    const shortcuts = new Map<string, Button>();
    for (const button of buttons ?? []) {
      const key = promptShortcutKey(id, button);
      if (key) shortcuts.set(key.toLowerCase(), button);
    }
    if (shortcuts.size === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const button = shortcuts.get(event.key.toLowerCase());
      if (!button || shortcutBlockedByFocus(event)) return;
      event.preventDefault();
      onClickButton(button);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [buttons, id, onClickButton]);

  let selectedCount = 0;
  for (const checked of checkedState) {
    if (checked) ++selectedCount;
  }
  const minNo = formOptions?.minNo ?? 0;
  const maxNo = formOptions?.maxNo ?? checkedState.length;
  const hasValidSelection = selectedCount >= minNo && selectedCount <= maxNo;
  const selectionSummary =
    minNo === maxNo ? `${selectedCount}/${minNo}` : `${selectedCount} selected`;

  const selectCard = cards?.map((card, index) => {
    const originalIndex = cardOriginalIndexes[index] ?? index;
    const copies = cardCounts[index] ?? 1;
    return choiceOptions == 'checkbox' ? (
      <div
        key={`${card.cardNumber}-${originalIndex}`}
        className={styles.cardDiv}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckBoxChange(Number(card.actionDataOverride));
        }}
      >
        <CardDisplay
          card={{
            borderColor: checkedState[originalIndex] ? '8' : '',
            ...card
          }}
          preventUseOnClick
        />
      </div>
    ) : (
      <div
        className={styles.cardDiv}
        key={`${card.cardNumber}-${originalIndex}`}
      >
        <CardDisplay card={card}>
          {copies > 1 ? (
            <div className={styles.copyCount}>
              <span className={styles.copyCountBadge}>×{copies}</span>
            </div>
          ) : null}
        </CardDisplay>
      </div>
    );
  });

  return (
    <form className={styles.form}>
      {selectCard?.length != 0 ? (
        <div className={styles.cardList}>{selectCard}</div>
      ) : null}
      {buttons?.length != 0 ? (
        <div className={styles.buttonList}>
          {groupButtons(buttons ?? []).map((entry, ix) => {
            if (Array.isArray(entry)) {
              return (
                <SplitButton
                  key={ix.toString()}
                  buttons={entry}
                  onClickButton={onClickButton}
                  onHint={setHint}
                />
              );
            }
            return (
              <button
                className={styles.buttonDiv}
                aria-keyshortcuts={promptShortcutKey(id, entry)}
                aria-description={entry.tooltip || undefined}
                onMouseEnter={() => setHint(entry.tooltip)}
                onMouseLeave={() => setHint(undefined)}
                onFocus={() => setHint(entry.tooltip)}
                onBlur={() => setHint(undefined)}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickButton(entry);
                }}
                key={ix.toString()}
              >
                {entry.caption}
              </button>
            );
          })}
        </div>
      ) : null}
      {hints.length > 0 ? (
        <div className={styles.buttonHint} aria-live="polite">
          {hints.map((text) => (
            <span
              key={text}
              className={
                text === (hint ?? (hints.length === 1 ? hints[0] : undefined))
                  ? undefined
                  : styles.buttonHintHidden
              }
            >
              {text}
            </span>
          ))}
        </div>
      ) : null}
      {formOptions || id === NAME_A_CARD ? (
        <div className={formOptions ? styles.multiChooseActions : undefined}>
          {formOptions ? (
            <div>
              {checkboxes?.length != 0 ? <div>{checkboxes}</div> : null}
              <button
                type="button"
                className={`${styles.buttonDiv} ${styles.multiChooseSubmit}`}
                disabled={!hasValidSelection}
                onClick={() => {
                  checkBoxSubmit();
                }}
              >
                {formOptions.caption} - {selectionSummary}
              </button>
            </div>
          ) : null}
          {id === NAME_A_CARD && (
            <Suspense fallback={null}>
              <SearchCardInput />
            </Suspense>
          )}
        </div>
      ) : null}
    </form>
  );
};
