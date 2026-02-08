import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_KEY = 'dashboard-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('light')) return 'light';
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  const setTheme = (value) => {
    setThemeState(value === 'dark' || value === 'light' ? value : 'light');
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
