import React from 'react';

const Filter = ({
  setHeroFilter,
  heroOptions
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
  heroOptions: { value: string; label: string }[];
}) => {
  const heroMap = heroOptions.reduce((acc, hero) => {
    if (!acc[hero.label]) {
      acc[hero.label] = [];
    }
    acc[hero.label].push(hero.value);
    return acc;
  }, {} as Record<string, string[]>);

  const uniqueHeroLabels = Object.keys(heroMap).sort((a, b) => a.localeCompare(b));

  const handleSelectHero = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;

    if (selectedLabel === '') {
      setHeroFilter([]);
    } else {
      setHeroFilter(heroMap[selectedLabel]);
    }
  };

  return (
    <select id="filterByHero" onChange={handleSelectHero}>
      <option value="">Filter by Hero</option>
      {uniqueHeroLabels.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Filter;
