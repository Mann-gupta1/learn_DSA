import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const updateThemeClass = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') as Theme | null || 'system';
  const resolved = savedTheme === 'system' ? getSystemTheme() : savedTheme;
  updateThemeClass(resolved);

  return {
    theme: savedTheme,
    resolvedTheme: resolved,
    setTheme: (theme) => {
      const resolved = theme === 'system' ? getSystemTheme() : theme;
      updateThemeClass(resolved);
      localStorage.setItem('theme', theme);
      set({ theme, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const newTheme = current === 'light' ? 'dark' : 'light';
      updateThemeClass(newTheme);
      localStorage.setItem('theme', newTheme);
      set({ theme: newTheme, resolvedTheme: newTheme });
    },
  };
});

