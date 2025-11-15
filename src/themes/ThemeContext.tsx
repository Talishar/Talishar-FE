import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, Theme, getThemeById } from './themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Load theme from localStorage or default to dark
    const savedThemeId = localStorage.getItem('talishar-theme');
    return getThemeById(savedThemeId || 'dark');
  });

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    localStorage.setItem('talishar-theme', themeId);
  };

  useEffect(() => {
    // Apply theme CSS variables to document root
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set all CSS custom properties
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-card-background', colors.cardBackground);
    root.style.setProperty('--theme-section-background', colors.sectionBackground);
    root.style.setProperty('--theme-section-background-transparent', colors.sectionBackgroundTransparent);
    
    // Text colors
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--color', colors.color);
    
    // Heading colors
    root.style.setProperty('--h1-color', colors.h1Color);
    root.style.setProperty('--h2-color', colors.h2Color);
    root.style.setProperty('--h3-color', colors.h3Color);
    root.style.setProperty('--h4-color', colors.h4Color);
    root.style.setProperty('--h5-color', colors.h5Color);
    root.style.setProperty('--h6-color', colors.h6Color);
    
    // Primary colors
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--primary', colors.primary); // Keep for backward compatibility
    root.style.setProperty('--theme-primary-inverse', colors.primaryInverse);
    root.style.setProperty('--primary-inverse', colors.primaryInverse); // Keep for backward compatibility
    root.style.setProperty('--theme-primary-hover', colors.primaryHover);
    root.style.setProperty('--primary-hover', colors.primaryHover);
    root.style.setProperty('--theme-primary-focus', colors.primaryFocus);
    root.style.setProperty('--primary-focus', colors.primaryFocus);
    
    // Secondary colors
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--theme-secondary-hover', colors.secondaryHover);
    root.style.setProperty('--secondary-hover', colors.secondaryHover);
    root.style.setProperty('--theme-secondary-inverse', colors.secondaryInverse);
    root.style.setProperty('--secondary-inverse', colors.secondaryInverse);
    root.style.setProperty('--theme-secondary-focus', colors.secondaryFocus);
    root.style.setProperty('--secondary-focus', colors.secondaryFocus);
    
    // Tertiary colors
    root.style.setProperty('--theme-tertiary', colors.tertiary);
    root.style.setProperty('--tertiary', colors.tertiary);
    root.style.setProperty('--theme-tertiary-hover', colors.tertiaryHover);
    root.style.setProperty('--tertiary-hover', colors.tertiaryHover);
    
    // Contrast colors
    root.style.setProperty('--theme-contrast', colors.contrast);
    root.style.setProperty('--contrast', colors.contrast);
    root.style.setProperty('--theme-contrast-hover', colors.contrastHover);
    root.style.setProperty('--contrast-hover', colors.contrastHover);
    root.style.setProperty('--theme-contrast-inverse', colors.contrastInverse);
    root.style.setProperty('--contrast-inverse', colors.contrastInverse);
    root.style.setProperty('--theme-contrast-focus', colors.contrastFocus);
    root.style.setProperty('--contrast-focus', colors.contrastFocus);
    
    // Borders and UI
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-light', colors.borderLight);
    root.style.setProperty('--muted-border-color', colors.mutedBorderColor);
    root.style.setProperty('--muted-color', colors.mutedColor);
    root.style.setProperty('--theme-form-background', colors.formBackground);
    root.style.setProperty('--theme-form-border', colors.formBorder);
    root.style.setProperty('--theme-form-active', colors.formActive);
    
    // Dropdown colors
    root.style.setProperty('--dropdown-background-color', colors.dropdownBackground);
    root.style.setProperty('--dropdown-border-color', colors.dropdownBorder);
    root.style.setProperty('--dropdown-color', colors.dropdownColor);
    root.style.setProperty('--dropdown-hover-background-color', colors.dropdownHoverBackground);
    
    // Status colors
    root.style.setProperty('--theme-alarm', colors.alarm);
    root.style.setProperty('--alarm', colors.alarm); // Keep for backward compatibility
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-danger', colors.danger);
    
    // Overlays
    root.style.setProperty('--theme-near-black', colors.nearBlack);
    root.style.setProperty('--near-black', colors.nearBlack); // Keep for backward compatibility
    root.style.setProperty('--theme-overlay', colors.overlay);
    root.style.setProperty('--modal-overlay-background-color', 'rgba(0, 0, 0, 0.4)'); // Very transparent for dialog backdrop
    
    // Modal backdrop styling - ensures no blur effect on modals
    root.style.setProperty('--theme-modal-backdrop-background', 'transparent');
    root.style.setProperty('--theme-modal-backdrop-filter', 'none');
    root.style.setProperty('--theme-modal-backdrop-opacity', '1');

    // Update body background - use dark texture as fallback for light theme
    const bgTexture = currentTheme.id === 'light' 
      ? "url('./img/backgrounds/dark_bg_texture.webp')"
      : colors.backgroundTexture;
    document.body.style.background = `${colors.background}, ${bgTexture}`;
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundColor = colors.cardBackground;
    
    // Set data attribute for potential CSS targeting
    root.setAttribute('data-theme', currentTheme.id);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
