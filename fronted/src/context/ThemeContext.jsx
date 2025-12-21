

// ============================================
// ThemeContext.js - Theme Context
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'pitcrew_theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Get saved theme from localStorage
    const saved = localStorage.getItem(THEME_KEY);
    return saved || THEMES.AUTO;
  });

  const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);

  // Resolve theme based on setting and system preference
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === THEMES.AUTO) {
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? THEMES.DARK
          : THEMES.LIGHT;
        return systemPreference;
      }
      return theme;
    };

    const resolved = resolveTheme();
    setResolvedTheme(resolved);

    // Apply theme to document
    if (resolved === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== THEMES.AUTO) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
      setResolvedTheme(newTheme);
      
      if (newTheme === THEMES.DARK) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error(`Invalid theme: ${newTheme}`);
      return;
    }

    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === THEMES.DARK,
    isLight: resolvedTheme === THEMES.LIGHT,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;