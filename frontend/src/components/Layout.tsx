import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useThemeStore } from '../stores/themeStore';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { formatXP } from '../utils/formatters';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import SideNav from './SideNav';
import { apiService } from '../services/api';
import { FaHome, FaBook, FaCode, FaEye, FaUser, FaSignInAlt, FaBars, FaChartLine, FaChevronDown, FaChevronRight, FaCheckCircle, FaSignOutAlt, FaTrophy, FaHistory, FaCog } from 'react-icons/fa';
import type { Concept } from '../types';

interface ConceptWithChildren extends Concept {
  children?: ConceptWithChildren[];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { info } = useToastStore();
  const { resolvedTheme } = useThemeStore();
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [concepts, setConcepts] = useState<ConceptWithChildren[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    info('Logged out successfully');
    setProfileDropdownOpen(false);
  };

  const { fetchBookmarks } = useBookmarkStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConcepts();
      fetchBookmarks();
    }
  }, [isAuthenticated, fetchBookmarks]);

  const fetchConcepts = async () => {
    try {
      const response = await apiService.getConcepts();
      setConcepts(response.concepts as ConceptWithChildren[]);
      const firstLevelIds = response.concepts.map((c: any) => c.id);
      setExpandedNodes(new Set(firstLevelIds));
    } catch (error) {
      console.error('Failed to fetch concepts:', error);
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderConceptNode = (concept: ConceptWithChildren, level: number = 0): JSX.Element => {
    const hasChildren = concept.children && concept.children.length > 0;
    const isExpanded = expandedNodes.has(concept.id);
    const isActive = location.pathname === `/concept/${concept.slug}`;
    const indent = level * 16;

    return (
      <div key={concept.id}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(concept.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <FaChevronDown className="w-3 h-3" />
              ) : (
                <FaChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <Link
            to={`/concept/${concept.slug}`}
            onClick={() => setProfileDropdownOpen(false)}
            className="flex-1 flex items-center gap-2 text-sm"
          >
            <FaBook className="w-3 h-3 text-gray-400" />
            <span className="font-medium flex-1 truncate">{concept.title}</span>
            {isActive && (
                      <FaCheckCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
            )}
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {concept.children!.map((child) => renderConceptNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/concepts', label: 'Concepts', icon: FaBook },
    { path: '/playground', label: 'Playground', icon: FaCode },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaChartLine },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${resolvedTheme}`}>
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-40 glass-card border-b border-white/20 dark:border-gray-700/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSideNavOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/" className="flex items-center space-x-2">
                  <span className="text-xl font-bold gradient-text">
                    DSA Platform
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-lg mx-8">
              <SearchBar />
            </div>

            <nav className="hidden md:flex space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <motion.div key={link.path} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                    <Link
                      to={link.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {isAuthenticated && user ? (
                <div className="hidden sm:flex items-center space-x-3 relative" ref={dropdownRef}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="relative focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-full transition-all"
                    >
                      <div className={`w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 ${profileDropdownOpen ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-transparent'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {/* Active indicator */}
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      )}
                    </button>
                  </motion.div>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl shadow-2xl border border-indigo-200/50 dark:border-indigo-800/50 z-50 overflow-hidden"
                      >
                        {/* Profile Header */}
                        <div className="p-4 border-b border-indigo-200/50 dark:border-indigo-800/50 bg-linear-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                {user.name}
                              </p>
                              {user.username && (
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                                  @{user.username}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                                  Level {user.level}
                                </span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                  {formatXP(user.xp)} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profile Menu Items */}
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 group"
                          >
                            <FaUser className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 group"
                          >
                            <FaChartLine className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/achievements"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 group"
                          >
                            <FaTrophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors" />
                            <span>Achievements</span>
                          </Link>

                          <Link
                            to="/history"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 group"
                          >
                            <FaHistory className="w-4 h-4 text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                            <span>Code History</span>
                          </Link>

                          <div className="border-t border-indigo-200/50 dark:border-indigo-800/50 my-1.5"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-600 dark:text-red-400 group"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50"
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="lg:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Side Navigation (Mobile only) */}
      <SideNav isOpen={sideNavOpen} onClose={() => setSideNavOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 pt-6 pb-8">{children}</main>

      {/* Footer with Glassmorphism */}
      <footer className="glass-card border-t border-white/20 dark:border-gray-700/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold gradient-text mb-4">About</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Interactive platform for learning coding and data structures through
                visualizations and live code execution.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold gradient-text mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/concepts"
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Explore Concepts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/playground"
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Code Playground
                  </Link>
                </li>
                <li>
                  <Link
                    to="/visualizations"
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Visualizations
                  </Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold gradient-text mb-4">Learning Modes</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>📚 Learn by Reading</li>
                <li>👁️ Learn by Seeing</li>
                <li>🛠️ Learn by Doing</li>
                <li>💬 Learn by Asking</li>
              </ul>
            </motion.div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Interactive Coding & DSA Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
