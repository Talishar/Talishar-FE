import React from 'react';
import CardDisplay from '../../cardDisplay/CardDisplay';
import SearchCardInput from '../../searchCardInput/SearchCardInput';
import { NAME_A_CARD } from '../constants';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';

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
        {id === NAME_A_CARD && <SearchCardInput />}
      </div>
    </form>
  );
};
