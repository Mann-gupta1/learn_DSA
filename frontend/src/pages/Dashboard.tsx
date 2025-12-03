import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useCodeHistoryStore } from '../stores/codeHistoryStore';
import { apiService } from '../services/api';
import { formatXP, formatRelativeTime } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBook, FaCode, FaChartLine, FaRocket, FaBookmark, FaHistory, FaChevronRight } from 'react-icons/fa';
import type { Concept } from '../types';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { bookmarks } = useBookmarkStore();
  const { getRecentEntries } = useCodeHistoryStore();
  const [recentConcepts, setRecentConcepts] = useState<Concept[]>([]);
  const [progressData, setProgressData] = useState<Array<{ day: string; xp: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentConcepts();
      fetchProgressData();
    }
  }, [isAuthenticated]);

  const fetchRecentConcepts = async () => {
    try {
      // Fetch user's actual progress to get recently accessed concepts
      const progressResponse = await apiService.getUserProgress();
      const progress = (progressResponse.progress || []) as Array<{
        conceptId: string;
        concept?: { id: string; title: string; slug: string };
        updatedAt?: string;
        createdAt?: string;
      }>;
      
      // Sort by updatedAt (most recent first) and get concept details
      const recentProgress = progress
        .filter(p => p.concept)
        .sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt ? new Date(a.updatedAt || a.createdAt || '').getTime() : 0;
          const dateB = b.updatedAt || b.createdAt ? new Date(b.updatedAt || b.createdAt || '').getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
      
      // Convert to Concept format
      const concepts: Concept[] = recentProgress
        .map(p => p.concept)
        .filter((c): c is { id: string; title: string; slug: string } => c !== null && c !== undefined)
        .map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          difficulty: 'beginner' as const,
          tags: [],
          description: '',
        }));
      
      setRecentConcepts(concepts);
    } catch (error) {
      console.error('Failed to fetch recent concepts:', error);
      // Fallback: fetch all concepts and get first 3
      try {
        const response = await apiService.getConcepts();
        const allConcepts = response.concepts as any[];
        
        const flatten = (concepts: any[]): Concept[] => {
          let flat: Concept[] = [];
          concepts.forEach((c) => {
            flat.push(c);
            if (c.children) flat = flat.concat(flatten(c.children));
          });
          return flat;
        };
        
        setRecentConcepts(flatten(allConcepts).slice(0, 3));
      } catch (fallbackError) {
        console.error('Failed to fetch concepts as fallback:', fallbackError);
        setRecentConcepts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      // Fetch user progress
      const progressResponse = await apiService.getUserProgress();
      const progress = (progressResponse.progress || []) as Array<{
        xpEarned: number;
        completedAt?: string;
        updatedAt?: string;
      }>;

      // Calculate XP per day for last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day
      
      // Initialize daily XP map with date strings as keys
      const dailyXP: { [key: string]: number } = {};
      const dayLabels: { [key: string]: string } = {};

      // Initialize all 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        dailyXP[dateKey] = 0;
        dayLabels[dateKey] = days[date.getDay()];
      }

      // Calculate XP from progress (use completedAt if available, otherwise updatedAt)
      progress.forEach((p) => {
        if (p.xpEarned > 0) {
          const dateStr = p.completedAt || p.updatedAt;
          if (dateStr) {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toISOString().split('T')[0];
            
            // Check if this date is within the last 7 days
            const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= 0 && daysDiff <= 6 && dailyXP[dateKey] !== undefined) {
              dailyXP[dateKey] += p.xpEarned;
            }
          }
        }
      });

      // Calculate XP from code runs (each run = 5 XP)
      const codeHistory = getRecentEntries(100); // Get more entries to calculate
      codeHistory.forEach((entry) => {
        if (entry.timestamp) {
          const date = new Date(entry.timestamp);
          date.setHours(0, 0, 0, 0);
          const dateKey = date.toISOString().split('T')[0];
          
          // Check if this date is within the last 7 days
          const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 0 && daysDiff <= 6 && dailyXP[dateKey] !== undefined) {
            dailyXP[dateKey] += 5; // 5 XP per code run
          }
        }
      });

      // Convert to array format for chart, showing last 7 days in order
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        chartData.push({
          day: dayLabels[dateKey] || days[date.getDay()],
          xp: dailyXP[dateKey] || 0,
        });
      }

      setProgressData(chartData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      // Fallback to empty data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        chartData.push({
          day: days[date.getDay()],
          xp: 0,
        });
      }
      setProgressData(chartData);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view your personalized dashboard.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const totalXP = user?.xp || 0;
  const level = user?.level || 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpProgress = Math.min(xpInCurrentLevel / 100, 1);
  const codeHistory = getRecentEntries(5);
  const recentBookmarks = bookmarks.slice(0, 3);

  const recommendedNext = recentConcepts[0];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-3">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Continue your learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 lg:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <FaRocket className="text-indigo-600 dark:text-indigo-400" />
                  Continue Learning
                </h2>
              </div>
              {recommendedNext ? (
                <div className="space-y-4">
                  <div className="p-6 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">{recommendedNext.title}</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                      {recommendedNext.description}
                    </p>
                    <Link
                      to={`/concept/${recommendedNext.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:scale-105"
                    >
                      Continue Learning
                      <FaChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Start exploring concepts to see your recommended next step!
                </p>
              )}
            </motion.div>

            {/* Progress Graph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 lg:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaChartLine className="text-indigo-600" />
                  Your Progress
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Code History */}
            {codeHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 lg:p-8 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FaHistory className="text-indigo-600" />
                    Recent Code
                  </h2>
                  <Link
                    to="/playground"
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2">
                  {codeHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded">
                            {entry.language}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                          {entry.code.substring(0, 50)}...
                        </p>
                      </div>
                      <Link
                        to="/playground"
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        Open →
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 lg:p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Level</span>
                    <span className="font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Total XP</span>
                    <span className="font-bold">{formatXP(totalXP)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-linear-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${xpProgress * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.max(0, 100 - xpInCurrentLevel)} / 100 XP to next level
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 lg:p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/concepts"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaBook className="text-indigo-600" />
                  <span>Explore Concepts</span>
                </Link>
                <Link
                  to="/playground"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaCode className="text-indigo-600" />
                  <span>Code Playground</span>
                </Link>
                <Link
                  to="/visualizations"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaChartLine className="text-indigo-600" />
                  <span>Visualizations</span>
                </Link>
              </div>
            </motion.div>

            {/* Bookmarks */}
            {recentBookmarks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 lg:p-8 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaBookmark className="text-indigo-600" />
                    Bookmarks
                  </h2>
                </div>
                <div className="space-y-2">
                  {recentBookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.conceptId}
                      to={`/concept/${bookmark.slug}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <p className="text-sm font-medium">{bookmark.conceptTitle}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

