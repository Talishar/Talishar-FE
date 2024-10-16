import React from 'react';
import styles from './Filter.module.css';
import { HEROES_OF_RATHE, youngToOldHeroesMapping } from './constants';

const Filter = ({
  setHeroFilter
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const handleSelectHero = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      setHeroFilter([]);
      return;
    }
    const secondHero = youngToOldHeroesMapping[e.target.value] ?? null;
    const heroArray = [e.target.value];
    if (secondHero) heroArray.push(secondHero);
    setHeroFilter(heroArray);
  };

return (
  <>
    <select
      name="Filter by hero"
      id="filterByHero"
      onChange={handleSelectHero}
    >
      <option value="">Filter by Hero</option>
      {HEROES_OF_RATHE.sort((a, b) => a.label.localeCompare(b.label)).map((hero, ix) => {
        return (
          <option value={hero.value} key={hero.value}>
            {hero.label}
          </option>
        );
      })}
    </select>
  </>
);
};

export default Filter;
