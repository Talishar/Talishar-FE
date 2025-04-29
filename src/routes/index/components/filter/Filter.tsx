import React from 'react';

const Filter = ({
  setHeroFilter,
  heroOptions
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
  heroOptions: { value: string; label: string }[];
}) => {
  const uniqueHeroOptions = Array.from(
    new Map(heroOptions.map((hero) => [hero.label, hero])).values()
  );

  const handleSelectHero = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedHeroId = e.target.value;

    if (selectedHeroId === '') {
      setHeroFilter([]);
    } else {
      setHeroFilter([selectedHeroId]);
    }
  };

  return (
    <select id="filterByHero" onChange={handleSelectHero}>
      <option value="">Filter by Hero</option>
      {uniqueHeroOptions
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((hero) => (
          <option key={hero.value} value={hero.value}>
            {hero.label}
          </option>
        ))}
    </select>
  );
};

export default Filter;
