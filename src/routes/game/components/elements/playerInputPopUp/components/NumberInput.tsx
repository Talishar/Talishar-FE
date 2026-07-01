import { useMemo, useState } from 'react';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';

export const NumberInput = (props: FormProps) => {
  const { buttons, onClickButton } = props;

  const { min, max, allowed, submitMode } = useMemo(() => {
    const values = (buttons ?? [])
      .map((button) => Number(button.buttonInput))
      .filter((value) => !Number.isNaN(value));
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
      allowed: new Set(values),
      submitMode: buttons?.[0]?.mode ?? 7
    };
  }, [buttons]);

  const [value, setValue] = useState<string>(String(min));

  const numericValue = Number(value);
  const isValid =
    value !== '' && !Number.isNaN(numericValue) && allowed.has(numericValue);

  const handleSubmit = () => {
    if (!isValid) return;
    onClickButton({ mode: submitMode, buttonInput: String(numericValue) });
  };

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles.numberInputRow}>
        <input
          type="number"
          className={styles.numberInputField}
          value={value}
          min={min}
          max={max}
          step={1}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          className={`${styles.buttonDiv} ${styles.numberInputSubmit}`}
          disabled={!isValid}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit();
          }}
        >
          Submit
        </button>
      </div>
      <div className={styles.numberInputHint}>
        Enter a number from {min} to {max}
      </div>
    </form>
  );
};
