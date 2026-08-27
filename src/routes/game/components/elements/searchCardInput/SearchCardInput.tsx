import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import styles from './SearchCardInput.module.css';
import { CARD_LIST } from 'constants/cardList';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { PROCESS_INPUT } from 'appConstants';
import { submitButton } from 'features/game/GameSlice';
import { useTranslation } from 'react-i18next';
import { RootState } from 'app/Store';

const DropdownIndicator = null;

// TODO: replace the any
const customStyles = {
  container: (_state: any) => styles.container,
  control: (state: any) =>
    classNames(styles.searchBox, { [styles.focused]: state.isFocused }),
  menuList: (_state: any) => styles.menuList,
  option: (state: any) =>
    classNames(styles.listItem, {
      [styles.selected]: state.isSelected
    }),
  input: (_state: any) => styles.styledInput,
  placeholder: (_state: any) => styles.placeholder
};

export const SearchCardInput = () => {
  const { t } = useTranslation();
  const [card, setCard] = useState<string>('');
  const [manualCardName, setManualCardName] = useState('');
  const dispatch = useAppDispatch();
  const isFuturesFormat = useAppSelector((state: RootState) => {
    const format = state.game.gameInfo.gameFormat ?? '';
    return ['futurecc', 'futurell', 'futuresage', 'open'].includes(format);
  });

  const options = useMemo(
    () =>
      CARD_LIST?.map((card) => {
        return { label: card, value: card };
      }),
    []
  );

  const handleKeyDown = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const handleChange = (newValue: any) => {
    setCard(newValue?.value || '');
  };

  const submitCardName = (cardName: string) => {
    const trimmedCardName = cardName.trim();
    if (!trimmedCardName) return;

    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.NAME_CARD,
          inputText: trimmedCardName
        }
      })
    );
  };

  const handleOnClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    submitCardName(card);
  };

  const handleManualSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    submitCardName(manualCardName);
  };

  return (
    <div className={styles.searchCardInput}>
      <div className={styles.searchInputRow}>
        <Select
          unstyled
          onKeyDown={handleKeyDown}
          options={options}
          classNames={customStyles}
          onChange={handleChange}
          isSearchable
          components={{ DropdownIndicator }}
        />
        <button
          className={styles.button}
          onClick={handleOnClick}
          disabled={!card}
        >
          {t('SEARCH_CARD.SUBMIT')}
        </button>
      </div>
      {isFuturesFormat ? (
        <div className={styles.manualInputSection}>
          <p className={styles.futureQueueNotice}>
            {t('SEARCH_CARD.FUTURE_QUEUE_NOTICE')}
          </p>
          <label className={styles.manualInputLabel} htmlFor="manual-card-name">
            {t('SEARCH_CARD.MANUAL_INPUT_LABEL')}
          </label>
          <div className={styles.manualInputRow}>
            <input
              id="manual-card-name"
              type="text"
              value={manualCardName}
              onChange={(event) => setManualCardName(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Enter') handleManualSubmit(event);
              }}
              placeholder={t('SEARCH_CARD.MANUAL_INPUT_PLACEHOLDER')}
              autoComplete="off"
            />
            <button
              className={styles.manualSubmitButton}
              onClick={handleManualSubmit}
              disabled={!manualCardName.trim()}
            >
              {t('SEARCH_CARD.SUBMIT_MANUAL_NAME')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchCardInput;
