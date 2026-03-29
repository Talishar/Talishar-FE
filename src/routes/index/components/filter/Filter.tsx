import React from 'react';
import styles from './Filter.module.css';
import { useTranslation } from 'react-i18next';

const Filter = ({
  setHeroFilter,
  heroOptions
}: {
  setHeroFilter: React.Dispatch<React.SetStateAction<string[]>>;
  heroOptions: { value: string; label: string }[];
}) => {
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  
  const heroMap = heroOptions.reduce((acc, hero) => {
    if (!acc[hero.label]) {
      acc[hero.label] = [];
    }
    acc[hero.label].push(hero.value);
    return acc;
  }, {} as Record<string, string[]>);

  const uniqueHeroLabels = Object.keys(heroMap).sort((a, b) =>
    a.localeCompare(b)
  );

  const handleSelectHero = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;

    if (selectedLabel === '') {
      setHeroFilter([]);
    } else {
      setHeroFilter(heroMap[selectedLabel]);
    }
  };

  return (
    <select
      id="filterByHero"
      className={styles.filterSelect}
      onChange={handleSelectHero}
    >
      <option value="">{t("FILTER.HERO_FILTER")}</option>
      {uniqueHeroLabels.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Filter;
