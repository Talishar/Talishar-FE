import React from 'react';

const Filter = ({
  setHeroFilter,
  heroOptions
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
  heroOptions: { value: string; label: string }[];
}) => {
  const handleSelectHero = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') {
      setHeroFilter([]);
      return;
    }
  };
  
  return (
    <select name="Filter by hero" id="filterByHero" onChange={handleSelectHero}>
      <option value="">Filter by Hero</option>
      {heroOptions
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((hero) => (
          <option value={hero.value} key={hero.value}>
            {hero.label}
          </option>
        ))}
    </select>
  );
};

export default Filter;
