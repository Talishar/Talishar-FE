import React, {useMemo} from 'react';
import Select from 'react-select';
import styles from './SearchCardInput.module.css';
import {FabCard} from 'features/interface/API/GetAllCards';
import { useGetAllCardsQuery } from 'features/api/apiSlice';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    color: 'var(--color)',
    margin: '0',
    textTransform: 'none',
    backgroundColor: 'var(--background-color)'
  }),
  input: (provided, state) => ({
    ...provided,
    width: '100%'
  }),
  options: (provided, state) => ({
    ...provided,
    width: '90%'
  })
};

export const SearchCardInput = () => {
  const { data, isLoading, error } = useGetAllCardsQuery<FabCard[]>({});

  const options = useMemo(() => data?.map((card, ix) => {
    return {label: card.name, value: card.printings[0].id}
  }), [isLoading])

  if (isLoading) {
    return (<div> Loading </div> )
  }
  console.log('options', options)
  return (
    <div>
      <Select
        unstyled
        options={options}
        className={styles.searchBox}
        styles={customStyles}
        isSearchable
      />
    </div>
  );
};

export default SearchCardInput;
