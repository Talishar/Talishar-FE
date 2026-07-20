import { Suspense } from 'react';
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
    formOptions,
    checkboxes,
    checkBoxSubmit
  } = props;

  const selectedCount = checkedState.filter(Boolean).length;
  const minNo = formOptions?.minNo ?? 0;
  const maxNo = formOptions?.maxNo ?? checkedState.length;
  const hasValidSelection = selectedCount >= minNo && selectedCount <= maxNo;
  const selectionRequirement =
    minNo === maxNo
      ? `${selectedCount}/${minNo} selected`
      : `${selectedCount} selected (choose ${minNo}-${maxNo})`;

  const selectCard = cards?.map((card, ix) => {
    return choiceOptions == 'checkbox' ? (
      <div
        key={ix.toString()}
        className={styles.cardDiv}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckBoxChange(Number(card.actionDataOverride));
        }}
      >
        <CardDisplay
          card={{ borderColor: checkedState[ix] ? '8' : '', ...card }}
          preventUseOnClick
        />
      </div>
    ) : (
      <div className={styles.cardDiv} key={ix.toString()}>
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
