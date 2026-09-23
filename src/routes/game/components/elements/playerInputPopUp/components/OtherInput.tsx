import React, { lazy, Suspense, useEffect } from 'react';
import Button from 'features/Button';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { NAME_A_CARD } from '../constants';
import { FormProps } from '../playerInputPopupTypes';
import { promptShortcutKey, shortcutBlockedByFocus } from '../promptShortcuts';
import styles from '../PlayerInputPopUp.module.css';

const SearchCardInput = lazy(
  () => import('../../searchCardInput/SearchCardInput')
);

export const OtherInput = (props: FormProps) => {
  const {
    cards,
    cardOriginalIndexes,
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
        <CardDisplay card={card} />
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
          {buttons?.map((button, ix) => {
            return (
              <button
                className={styles.buttonDiv}
                aria-keyshortcuts={promptShortcutKey(id, button)}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickButton(button);
                }}
                key={ix.toString()}
              >
                {button.caption}
              </button>
            );
          })}
        </div>
      ) : null}
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
    </form>
  );
};
