// Theme definitions for Talishar
export interface Theme {
  name: string;
  id: string;
  colors: {
    // Background colors
    background: string;
    backgroundTexture: string;
    cardBackground: string;
    sectionBackground: string;
    sectionBackgroundTransparent: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;
    color: string;  // Base color for Pico
    
    // Heading colors
    h1Color: string;
    h2Color: string;
    h3Color: string;
    h4Color: string;
    h5Color: string;
    h6Color: string;
    
    // Primary brand colors
    primary: string;
    primaryInverse: string;
    primaryHover: string;
    primaryFocus: string;
    
    // Secondary colors
    secondary: string;
    secondaryHover: string;
    secondaryInverse: string;
    secondaryFocus: string;
    
    // Tertiary colors (for additional UI elements)
    tertiary: string;
    tertiaryHover: string;
    
    // Contrast colors
    contrast: string;
    contrastHover: string;
    contrastInverse: string;
    contrastFocus: string;
    
    // UI element colors
    border: string;
    borderLight: string;
    mutedBorderColor: string;
    mutedColor: string;
    formBackground: string;
    formBorder: string;
    formActive: string;
    
    // Dropdown colors
    dropdownBackground: string;
    dropdownBorder: string;
    dropdownColor: string;
    dropdownHoverBackground: string;
    
    // Status colors
    alarm: string;
    success: string;
    warning: string;
    danger: string;
    
    // Overlay and transparency
    nearBlack: string;
    overlay: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'Dark (Default)',
    id: 'dark',
    colors: {
      background: 'radial-gradient(transparent, black)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1e2329',
      sectionBackground: 'linear-gradient(135deg, rgba(30, 35, 41, 0.8) 0%, rgba(26, 31, 38, 0.9) 100%)',
      sectionBackgroundTransparent: 'rgba(30, 35, 41, 0.8)',
      
      text: '#f4eded',
      textSecondary: '#e0e0e0',
      textMuted: 'rgba(255, 255, 255, 0.6)',
      color: '#f4eded',
      
      h1Color: '#f4eded',
      h2Color: '#e0e0e0',
      h3Color: '#d4d4d4',
      h4Color: '#c8c8c8',
      h5Color: '#bcbcbc',
      h6Color: '#b0b0b0',
      
      primary: '#d4af37',
      primaryInverse: '#000000',
      primaryHover: '#e8c547',
      primaryFocus: 'rgba(212, 175, 55, 0.125)',
      
      secondary: '#606569',
      secondaryHover: '#757a7f',
      secondaryInverse: '#ffffff',
      secondaryFocus: 'rgba(96, 101, 105, 0.125)',
      
      tertiary: '#4a5056',
      tertiaryHover: '#5a6066',
      
      contrast: '#f4eded',
      contrastHover: '#ffffff',
      contrastInverse: '#000000',
      contrastFocus: 'rgba(244, 237, 237, 0.125)',
      
      border: 'rgba(255, 255, 255, 0.2)',
      borderLight: 'rgba(255, 255, 255, 0.1)',
      mutedBorderColor: '#202632',
      mutedColor: '#7b8495',
      formBackground: '#33383d',
      formBorder: '#797c80',
      formActive: '#33383d',
      
      // Dropdown colors
      dropdownBackground: '#33383d',
      dropdownBorder: '#797c80',
      dropdownColor: '#f4eded',
      dropdownHoverBackground: 'rgba(212, 175, 55, 0.15)',
      
      alarm: '#c62828',
      success: '#28a745',
      warning: '#feca57',
      danger: '#dc3545',
      
      nearBlack: 'rgba(0, 0, 0, 0.85)',
      overlay: 'rgba(0, 0, 0, 0.7)',
    }
  },
  {
    name: 'Light',
    id: 'light',
    colors: {
      background: 'radial-gradient(transparent, #252525)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#3a3a3a',
      sectionBackground: 'linear-gradient(135deg, rgba(58, 58, 58, 0.85) 0%, rgba(45, 45, 45, 0.9) 100%)',
      sectionBackgroundTransparent: 'rgba(58, 58, 58, 0.85)',
      
      text: '#f0f0f0',
      textSecondary: '#e0e0e0',
      textMuted: 'rgba(240, 240, 240, 0.65)',
      color: '#f0f0f0',
      
      h1Color: '#ffffff',
      h2Color: '#f0f0f0',
      h3Color: '#e0e0e0',
      h4Color: '#d8d8d8',
      h5Color: '#d0d0d0',
      h6Color: '#c8c8c8',
      
      primary: '#d4af37',
      primaryInverse: '#1a1a1a',
      primaryHover: '#e0bb47',
      primaryFocus: 'rgba(212, 175, 55, 0.125)',
      
      secondary: '#5a5a5a',
      secondaryHover: '#6a6a6a',
      secondaryInverse: '#f0f0f0',
      secondaryFocus: 'rgba(90, 90, 90, 0.125)',
      
      tertiary: '#4a4a4a',
      tertiaryHover: '#5a5a5a',
      
      contrast: '#f0f0f0',
      contrastHover: '#ffffff',
      contrastInverse: '#1a1a1a',
      contrastFocus: 'rgba(240, 240, 240, 0.125)',
      
      border: 'rgba(212, 175, 55, 0.3)',
      borderLight: 'rgba(212, 175, 55, 0.15)',
      mutedBorderColor: '#4f4f4f',
      mutedColor: '#b0b0b0',
      formBackground: '#454545',
      formBorder: '#5a5a5a',
      formActive: '#4a4a4a',
      
      // Dropdown colors
      dropdownBackground: '#454545',
      dropdownBorder: '#5a5a5a',
      dropdownColor: '#f0f0f0',
      dropdownHoverBackground: 'rgba(212, 175, 55, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(26, 26, 26, 0.9)',
      overlay: 'rgba(26, 26, 26, 0.75)',
    }
  },
  {
    name: 'Midnight Blue',
    id: 'blue',
    colors: {
      background: 'radial-gradient(transparent, #0a0e27)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1a1f3a',
      sectionBackground: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(18, 22, 42, 0.9) 100%)',
      sectionBackgroundTransparent: 'rgba(26, 31, 58, 0.8)',
      
      text: '#e0e7ff',
      textSecondary: '#c7d2fe',
      textMuted: 'rgba(224, 231, 255, 0.6)',
      color: '#e0e7ff',
      
      h1Color: '#f0f4ff',
      h2Color: '#e0e7ff',
      h3Color: '#c7d2fe',
      h4Color: '#a5b4fc',
      h5Color: '#93c5fd',
      h6Color: '#60a5fa',
      
      primary: '#60a5fa',
      primaryInverse: '#0a0e27',
      primaryHover: '#93c5fd',
      primaryFocus: 'rgba(96, 165, 250, 0.125)',
      
      secondary: '#475569',
      secondaryHover: '#64748b',
      secondaryInverse: '#f0f4ff',
      secondaryFocus: 'rgba(71, 85, 105, 0.125)',
      
      tertiary: '#334155',
      tertiaryHover: '#475569',
      
      contrast: '#e0e7ff',
      contrastHover: '#f0f4ff',
      contrastInverse: '#0a0e27',
      contrastFocus: 'rgba(224, 231, 255, 0.125)',
      
      border: 'rgba(96, 165, 250, 0.3)',
      borderLight: 'rgba(96, 165, 250, 0.15)',
      mutedBorderColor: '#1e293b',
      mutedColor: '#94a3b8',
      formBackground: '#1e293b',
      formBorder: '#475569',
      formActive: '#334155',
      
      // Dropdown colors
      dropdownBackground: '#1e293b',
      dropdownBorder: '#475569',
      dropdownColor: '#e0e7ff',
      dropdownHoverBackground: 'rgba(96, 165, 250, 0.15)',
      
      alarm: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(10, 14, 39, 0.85)',
      overlay: 'rgba(10, 14, 39, 0.7)',
    }
  },
  {
    name: 'Royal Purple',
    id: 'purple',
    colors: {
      background: 'radial-gradient(transparent, #0f0a15)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1a1225',
      sectionBackground: 'linear-gradient(135deg, rgba(26, 18, 37, 0.9) 0%, rgba(15, 10, 21, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(26, 18, 37, 0.9)',
      
      text: '#e6dff5',
      textSecondary: '#d4cae8',
      textMuted: 'rgba(230, 223, 245, 0.6)',
      color: '#e6dff5',
      
      h1Color: '#f5f1ff',
      h2Color: '#e6dff5',
      h3Color: '#d4cae8',
      h4Color: '#c8a8ff',
      h5Color: '#b088f0',
      h6Color: '#9868e0',
      
      primary: '#8b5cf6',
      primaryInverse: '#0f0a15',
      primaryHover: '#a78bfa',
      primaryFocus: 'rgba(139, 92, 246, 0.125)',
      
      secondary: '#5a3d80',
      secondaryHover: '#6f5199',
      secondaryInverse: '#f5f1ff',
      secondaryFocus: 'rgba(90, 61, 128, 0.125)',
      
      tertiary: '#3e2858',
      tertiaryHover: '#5a3d80',
      
      contrast: '#e6dff5',
      contrastHover: '#f5f1ff',
      contrastInverse: '#0f0a15',
      contrastFocus: 'rgba(230, 223, 245, 0.125)',
      
      border: 'rgba(201, 162, 39, 0.3)',
      borderLight: 'rgba(201, 162, 39, 0.15)',
      mutedBorderColor: '#2d1f42',
      mutedColor: '#a8938f',
      formBackground: '#2d1f42',
      formBorder: '#5a3d80',
      formActive: '#3e2858',
      
      // Dropdown colors
      dropdownBackground: '#2d1f42',
      dropdownBorder: '#5a3d80',
      dropdownColor: '#e6dff5',
      dropdownHoverBackground: 'rgba(201, 162, 39, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(15, 10, 21, 0.9)',
      overlay: 'rgba(15, 10, 21, 0.75)',
    }
  },
  {
    name: 'Crimson Red',
    id: 'red',
    colors: {
      background: 'radial-gradient(transparent, #0d0a0a)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1a1515',
      sectionBackground: 'linear-gradient(135deg, rgba(26, 21, 21, 0.85) 0%, rgba(18, 12, 12, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(26, 21, 21, 0.85)',
      
      text: '#e8e0e0',
      textSecondary: '#d8d0d0',
      textMuted: 'rgba(232, 224, 224, 0.6)',
      color: '#e8e0e0',
      
      h1Color: '#f8f0f0',
      h2Color: '#e8e0e0',
      h3Color: '#d8d0d0',
      h4Color: '#e85555',
      h5Color: '#d63a3a',
      h6Color: '#c42020',
      
      primary: '#d63033',
      primaryInverse: '#0d0a0a',
      primaryHover: '#f04d50',
      primaryFocus: 'rgba(214, 48, 51, 0.125)',
      
      secondary: '#3a3333',
      secondaryHover: '#4a4444',
      secondaryInverse: '#f8f0f0',
      secondaryFocus: 'rgba(58, 51, 51, 0.125)',
      
      tertiary: '#2a2222',
      tertiaryHover: '#3a3333',
      
      contrast: '#e8e0e0',
      contrastHover: '#f8f0f0',
      contrastInverse: '#0d0a0a',
      contrastFocus: 'rgba(232, 224, 224, 0.125)',
      
      border: 'rgba(201, 162, 39, 0.3)',
      borderLight: 'rgba(201, 162, 39, 0.15)',
      mutedBorderColor: '#2a2222',
      mutedColor: '#a0888a',
      formBackground: '#252020',
      formBorder: '#3a3333',
      formActive: '#2a2222',
      
      // Dropdown colors
      dropdownBackground: '#252020',
      dropdownBorder: '#3a3333',
      dropdownColor: '#e8e0e0',
      dropdownHoverBackground: 'rgba(201, 162, 39, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(13, 10, 10, 0.9)',
      overlay: 'rgba(13, 10, 10, 0.8)',
    }
  },
  {
    name: 'Emerald Green',
    id: 'green',
    colors: {
      background: 'radial-gradient(transparent, #0a150d)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#151f1a',
      sectionBackground: 'linear-gradient(135deg, rgba(21, 31, 26, 0.85) 0%, rgba(12, 18, 15, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(21, 31, 26, 0.85)',
      
      text: '#e0e8e4',
      textSecondary: '#d0d8d4',
      textMuted: 'rgba(224, 232, 228, 0.6)',
      color: '#e0e8e4',
      
      h1Color: '#f0f8f4',
      h2Color: '#e0e8e4',
      h3Color: '#d0d8d4',
      h4Color: '#5fd3a5',
      h5Color: '#45c991',
      h6Color: '#2fb76d',
      
      primary: '#34d356',
      primaryInverse: '#0a150d',
      primaryHover: '#52e070',
      primaryFocus: 'rgba(52, 211, 86, 0.125)',
      
      secondary: '#2a3f36',
      secondaryHover: '#3a4f46',
      secondaryInverse: '#f0f8f4',
      secondaryFocus: 'rgba(42, 63, 54, 0.125)',
      
      tertiary: '#1a2f26',
      tertiaryHover: '#2a3f36',
      
      contrast: '#e0e8e4',
      contrastHover: '#f0f8f4',
      contrastInverse: '#0a150d',
      contrastFocus: 'rgba(224, 232, 228, 0.125)',
      
      border: 'rgba(201, 162, 39, 0.3)',
      borderLight: 'rgba(201, 162, 39, 0.15)',
      mutedBorderColor: '#1a2f26',
      mutedColor: '#6ec89a',
      formBackground: '#1f2f28',
      formBorder: '#2a3f36',
      formActive: '#1a2f26',
      
      // Dropdown colors
      dropdownBackground: '#1f2f28',
      dropdownBorder: '#2a3f36',
      dropdownColor: '#e0e8e4',
      dropdownHoverBackground: 'rgba(201, 162, 39, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(10, 21, 13, 0.9)',
      overlay: 'rgba(10, 21, 13, 0.8)',
    }
  },
  {
    name: 'Magenta Pink',
    id: 'magenta',
    colors: {
      background: 'radial-gradient(transparent, #110914)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1e141f',
      sectionBackground: 'linear-gradient(135deg, rgba(30, 20, 31, 0.85) 0%, rgba(17, 9, 20, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(30, 20, 31, 0.85)',
      
      text: '#e8d8eb',
      textSecondary: '#d8cad8',
      textMuted: 'rgba(232, 216, 235, 0.6)',
      color: '#e8d8eb',
      
      h1Color: '#f5edf8',
      h2Color: '#e8d8eb',
      h3Color: '#d8cad8',
      h4Color: '#d956a6',
      h5Color: '#c84896',
      h6Color: '#b83a86',
      
      primary: '#d74bb8',
      primaryInverse: '#110914',
      primaryHover: '#ed5ed0',
      primaryFocus: 'rgba(215, 75, 184, 0.125)',
      
      secondary: '#3d3642',
      secondaryHover: '#4d464f',
      secondaryInverse: '#f5edf8',
      secondaryFocus: 'rgba(61, 54, 66, 0.125)',
      
      tertiary: '#2a2230',
      tertiaryHover: '#3d3642',
      
      contrast: '#e8d8eb',
      contrastHover: '#f5edf8',
      contrastInverse: '#110914',
      contrastFocus: 'rgba(232, 216, 235, 0.125)',
      
      border: 'rgba(215, 75, 184, 0.3)',
      borderLight: 'rgba(215, 75, 184, 0.15)',
      mutedBorderColor: '#2a2230',
      mutedColor: '#8a8ca0',
      formBackground: '#262030',
      formBorder: '#3d3642',
      formActive: '#2a2230',
      
      // Dropdown colors
      dropdownBackground: '#262030',
      dropdownBorder: '#3d3642',
      dropdownColor: '#e8d8eb',
      dropdownHoverBackground: 'rgba(215, 75, 184, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(17, 9, 20, 0.9)',
      overlay: 'rgba(17, 9, 20, 0.8)',
    }
  },
  {
    name: 'Bronze Brown & Gold',
    id: 'bronze',
    colors: {
      background: 'radial-gradient(transparent, #15100a)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#201a15',
      sectionBackground: 'linear-gradient(135deg, rgba(32, 26, 21, 0.85) 0%, rgba(22, 16, 11, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(32, 26, 21, 0.85)',
      
      text: '#e8dfc0',
      textSecondary: '#d8d0b0',
      textMuted: 'rgba(232, 223, 192, 0.6)',
      color: '#e8dfc0',
      
      h1Color: '#f5efd5',
      h2Color: '#e8dfc0',
      h3Color: '#d8d0b0',
      h4Color: '#d4a542',
      h5Color: '#c89533',
      h6Color: '#b88525',
      
      primary: '#c9a227',
      primaryInverse: '#0f0d0a',
      primaryHover: '#dbb03a',
      primaryFocus: 'rgba(201, 162, 39, 0.125)',
      
      secondary: '#3a3838',
      secondaryHover: '#4a4848',
      secondaryInverse: '#f5efd5',
      secondaryFocus: 'rgba(58, 56, 56, 0.125)',
      
      tertiary: '#282626',
      tertiaryHover: '#3a3838',
      
      contrast: '#e8dfc0',
      contrastHover: '#f5efd5',
      contrastInverse: '#0f0d0a',
      contrastFocus: 'rgba(232, 223, 192, 0.125)',
      
      border: 'rgba(201, 162, 39, 0.3)',
      borderLight: 'rgba(201, 162, 39, 0.15)',
      mutedBorderColor: '#282626',
      mutedColor: '#8a8a8a',
      formBackground: '#242220',
      formBorder: '#3a3838',
      formActive: '#282626',
      
      // Dropdown colors
      dropdownBackground: '#242220',
      dropdownBorder: '#3a3838',
      dropdownColor: '#e8dfc0',
      dropdownHoverBackground: 'rgba(201, 162, 39, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(15, 13, 10, 0.9)',
      overlay: 'rgba(15, 13, 10, 0.8)',
    }
  },
  {
    name: 'Navy Blue & Gold',
    id: 'navy-blue-gold',
    colors: {
      background: 'radial-gradient(transparent, #0f1419)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1a1f2e',
      sectionBackground: 'linear-gradient(135deg, rgba(26, 31, 46, 0.85) 0%, rgba(15, 20, 25, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(26, 31, 46, 0.85)',
      
      text: '#e8dfc0',
      textSecondary: '#d8d0b0',
      textMuted: 'rgba(232, 223, 192, 0.6)',
      color: '#e8dfc0',
      
      h1Color: '#f5efd5',
      h2Color: '#e8dfc0',
      h3Color: '#d8d0b0',
      h4Color: '#d4a542',
      h5Color: '#c89533',
      h6Color: '#b88525',
      
      primary: '#c9a227',
      primaryInverse: '#0f1419',
      primaryHover: '#dbb03a',
      primaryFocus: 'rgba(201, 162, 39, 0.125)',
      
      secondary: '#3a3d47',
      secondaryHover: '#4a4d57',
      secondaryInverse: '#f5efd5',
      secondaryFocus: 'rgba(58, 61, 71, 0.125)',
      
      tertiary: '#282d38',
      tertiaryHover: '#3a3d47',
      
      contrast: '#e8dfc0',
      contrastHover: '#f5efd5',
      contrastInverse: '#0f1419',
      contrastFocus: 'rgba(232, 223, 192, 0.125)',
      
      border: 'rgba(201, 162, 39, 0.3)',
      borderLight: 'rgba(201, 162, 39, 0.15)',
      mutedBorderColor: '#282d38',
      mutedColor: '#8a8ca0',
      formBackground: '#242a37',
      formBorder: '#3a3d47',
      formActive: '#282d38',
      
      // Dropdown colors
      dropdownBackground: '#242a37',
      dropdownBorder: '#3a3d47',
      dropdownColor: '#e8dfc0',
      dropdownHoverBackground: 'rgba(201, 162, 39, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(15, 20, 25, 0.9)',
      overlay: 'rgba(15, 20, 25, 0.8)',
    }
  },
  {
    name: 'Crimson & Silver',
    id: 'crimson-silver',
    colors: {
      background: 'radial-gradient(transparent, #0a0e12)',
      backgroundTexture: "url('./img/backgrounds/dark_bg_texture.webp')",
      cardBackground: '#1f232b',
      sectionBackground: 'linear-gradient(135deg, rgba(31, 35, 43, 0.85) 0%, rgba(10, 14, 18, 0.95) 100%)',
      sectionBackgroundTransparent: 'rgba(31, 35, 43, 0.85)',
      
      text: '#e5d8d0',
      textSecondary: '#d4cac0',
      textMuted: 'rgba(229, 216, 208, 0.6)',
      color: '#e5d8d0',
      
      h1Color: '#f2ede8',
      h2Color: '#e5d8d0',
      h3Color: '#d4cac0',
      h4Color: '#d84a5a',
      h5Color: '#c83d4b',
      h6Color: '#b8333c',
      
      primary: '#d63545',
      primaryInverse: '#0a0e12',
      primaryHover: '#f04452',
      primaryFocus: 'rgba(214, 53, 69, 0.125)',
      
      secondary: '#404550',
      secondaryHover: '#50555f',
      secondaryInverse: '#f2ede8',
      secondaryFocus: 'rgba(64, 69, 80, 0.125)',
      
      tertiary: '#2d323a',
      tertiaryHover: '#404550',
      
      contrast: '#e5d8d0',
      contrastHover: '#f2ede8',
      contrastInverse: '#0a0e12',
      contrastFocus: 'rgba(229, 216, 208, 0.125)',
      
      border: 'rgba(214, 53, 69, 0.3)',
      borderLight: 'rgba(214, 53, 69, 0.15)',
      mutedBorderColor: '#2d323a',
      mutedColor: '#8a8ca0',
      formBackground: '#292e37',
      formBorder: '#404550',
      formActive: '#2d323a',
      
      // Dropdown colors
      dropdownBackground: '#292e37',
      dropdownBorder: '#404550',
      dropdownColor: '#e5d8d0',
      dropdownHoverBackground: 'rgba(214, 53, 69, 0.15)',
      
      alarm: '#f43f5e',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#dc2626',
      
      nearBlack: 'rgba(10, 14, 18, 0.9)',
      overlay: 'rgba(10, 14, 18, 0.8)',
    }
  }
];

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0];
};
