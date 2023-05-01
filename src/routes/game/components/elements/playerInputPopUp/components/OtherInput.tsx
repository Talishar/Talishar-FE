import CardDisplay from '../../cardDisplay/CardDisplay';
import SearchCardInput from '../../searchCardInput/SearchCardInput';
import { NAME_A_CARD } from '../constants';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';

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
      <div>
        {formOptions ? (
          <div>
            {checkboxes?.length != 0 ? <div>{checkboxes}</div> : null}
            <div
              className={styles.buttonDiv}
              onClick={() => {
                checkBoxSubmit();
              }}
            >
              {formOptions.caption}
            </div>
          </div>
        ) : null}
        {id === NAME_A_CARD && <SearchCardInput />}
      </div>
    </form>
  );
};
