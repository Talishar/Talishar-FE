import React, { Suspense, useEffect, useMemo, useState } from 'react';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { NAME_A_CARD } from '../constants';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';
import { lazyWithRetry } from 'utils/lazyWithRetry';

const SearchCardInput = lazyWithRetry(
  () => import('../../searchCardInput/SearchCardInput')
);

export const OtherInput = (props: FormProps) => {
  const {
    cards,
    buttons,
    choiceOptions,
    checkedState,
    handleCheckBoxChange,
    onClickButton,
    id,
    customInput,
    formOptions,
    checkboxes,
    checkBoxSubmit
  } = props;
  const [cardSearch, setCardSearch] = useState('');
  const searchable = customInput === 'SEARCHABLE';
  const cardListKey = cards
    .map((card) => `${card.cardNumber}:${card.actionDataOverride ?? ''}`)
    .join('|');

  useEffect(() => {
    setCardSearch('');
  }, [cardListKey]);

  const normalizedSearch = cardSearch.trim().toLocaleLowerCase();
  const visibleCards = useMemo(
    () =>
      cards
        .map((card, originalIndex) => ({ card, originalIndex }))
        .filter(
          ({ card }) =>
            !searchable ||
            !normalizedSearch ||
            `${card.cardName ?? ''} ${card.cardNumber}`
              .toLocaleLowerCase()
              .includes(normalizedSearch)
        ),
    [cards, normalizedSearch, searchable]
  );

  const selectedCount = checkedState.filter(Boolean).length;
  const minNo = formOptions?.minNo ?? 0;
  const maxNo = formOptions?.maxNo ?? checkedState.length;
  const hasValidSelection = selectedCount >= minNo && selectedCount <= maxNo;
  const selectionRequirement =
    minNo === maxNo
      ? `${selectedCount}/${minNo} selected`
      : `${selectedCount} selected (choose ${minNo}-${maxNo})`;

  const selectCard = visibleCards?.map(({ card, originalIndex }) => {
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
      {searchable ? (
        <div className={styles.cardSearchContainer}>
          <input
            type="search"
            className={styles.cardSearchInput}
            value={cardSearch}
            onChange={(event) => setCardSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Search cards by name..."
            aria-label="Search cards by name"
            autoFocus
          />
          {cardSearch ? (
            <span className={styles.cardSearchCount} aria-live="polite">
              {visibleCards.length} of {cards.length}
            </span>
          ) : null}
        </div>
      ) : null}
      {selectCard?.length != 0 ? (
        <div className={styles.cardList}>{selectCard}</div>
      ) : searchable && cardSearch ? (
        <div className={styles.noSearchResults} role="status">
          No matching cards
        </div>
      ) : null}
      {buttons?.length != 0 ? (
        <div className={styles.buttonList}>
          {buttons?.map((button, ix) => {
            return (
              <button
                className={styles.buttonDiv}
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
              {formOptions.caption} ({selectionRequirement})
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
