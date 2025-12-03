import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg glass-card hover:bg-opacity-80 transition-all"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <FaSun className="w-5 h-5 text-yellow-400" />
      ) : (
        <FaMoon className="w-5 h-5 text-indigo-600" />
      )}
    </motion.button>
  );
}

