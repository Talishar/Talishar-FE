import React from 'react';
import { useTheme } from './ThemeContext';
import styles from './ThemeShowcase.module.css';

/**
 * ThemeShowcase - A visual preview of all available themes
 * Useful for testing and demonstrating theme changes
 */
const ThemeShowcase: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className={styles.showcase}>
      <h2 className={styles.title}>Theme Showcase</h2>
      <p className={styles.subtitle}>Click on any theme to preview it</p>
      
      <div className={styles.themesGrid}>
        {availableThemes.map((theme) => (
          <div
            key={theme.id}
            className={`${styles.themeCard} ${currentTheme.id === theme.id ? styles.active : ''}`}
            onClick={() => setTheme(theme.id)}
          >
            <div className={styles.themeHeader}>
              <h3>{theme.name}</h3>
              {currentTheme.id === theme.id && (
                <span className={styles.badge}>Active</span>
              )}
            </div>
            
            <div className={styles.colorPalette}>
              <div 
                className={styles.colorSwatch}
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div 
                className={styles.colorSwatch}
                style={{ backgroundColor: theme.colors.cardBackground }}
                title="Card Background"
              />
              <div 
                className={styles.colorSwatch}
                style={{ backgroundColor: theme.colors.text }}
                title="Text"
              />
              <div 
                className={styles.colorSwatch}
                style={{ backgroundColor: theme.colors.success }}
                title="Success"
              />
            </div>
            
            <div className={styles.preview}>
              <div 
                className={styles.previewContent}
                style={{
                  background: theme.colors.sectionBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                <p style={{ color: theme.colors.textSecondary }}>Sample text</p>
                <button 
                  className={styles.previewButton}
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.primaryInverse
                  }}
                >
                  Button
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.info}>
        <p>Current Theme: <strong>{currentTheme.name}</strong></p>
        <p className={styles.hint}>
          Your theme preference is automatically saved and will persist across sessions.
        </p>
      </div>
    </div>
  );
};

export default ThemeShowcase;
