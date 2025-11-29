import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import styles from './SearchCardInput.module.css';
import { CARD_LIST } from 'constants/cardList';
import classNames from 'classnames';
import { useAppDispatch } from 'app/Hooks';
import { PROCESS_INPUT } from 'appConstants';
import { submitButton } from 'features/game/GameSlice';

const DropdownIndicator = null;

// TODO: replace the any
const customStyles = {
  container: (state: any) => styles.container,
  control: (state: any) =>
    classNames(styles.searchBox, { [styles.focused]: state.isFocused }),
  menuList: (state: any) => styles.menuList,
  option: (state: any) =>
    classNames(styles.listItem, {
      [styles.selected]: state.isSelected
    }),
  input: (state: any) => styles.styledInput
};

export const SearchCardInput = () => {
  const [card, setCard] = useState<string>('');
  const dispatch = useAppDispatch();

  const options = useMemo(
    () =>
      CARD_LIST?.map((card, ix) => {
        return { label: card, value: card };
      }),
    []
  );

  const handleKeyDown = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const handleChange = (newValue: any, actionMeta: any) => {
    setCard(newValue?.value || '');
  };

  const handleOnClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      submitButton({
        button: { mode: PROCESS_INPUT.NAME_CARD, inputText: card }
      })
    );
  };

  return (
    <div>
      <Select
        unstyled
        onKeyDown={handleKeyDown}
        options={options}
        classNames={customStyles}
        onChange={handleChange}
        isSearchable
        components={{ DropdownIndicator }}
      />
      <hr />
      <button className={styles.button} onClick={handleOnClick}>
        Submit
      </button>
    </div>
  );
};

export default SearchCardInput;
