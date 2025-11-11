import React from 'react';
import { useTheme } from './ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className={styles.themeToggleContainer}>
      <select
        id="theme-selector"
        value={currentTheme.id}
        onChange={(e) => setTheme(e.target.value)}
        className={styles.select}
        aria-label="Select theme"
      >
        {availableThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeToggle;
