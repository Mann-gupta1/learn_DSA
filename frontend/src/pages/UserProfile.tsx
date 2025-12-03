import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { formatXP, formatDate } from '../utils/formatters';
import { useAchievementStore } from '../stores/achievementStore';
import AchievementList from '../components/AchievementList';
import { FaUser, FaTrophy, FaChartLine, FaCheckCircle, FaClock, FaArrowLeft, FaStar, FaAward } from 'react-icons/fa';

interface Progress {
  conceptId: string;
  conceptTitle: string;
  status: 'not_started' | 'in_progress' | 'completed';
  xpEarned: number;
  completedAt?: string;
}

export default function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProgress();
    }
  }, [isAuthenticated]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProgress();
      const progressData = (response.progress || []) as Array<{
        userId: string;
        conceptId: string;
        concept?: { id: string; title: string; slug: string };
        status: 'not_started' | 'in_progress' | 'completed';
        xpEarned: number;
        completedAt?: string;
      }>;
      
      setProgress(progressData.map((p) => ({
        conceptId: p.conceptId,
        conceptTitle: p.concept?.title || 'Unknown Concept',
        status: p.status,
        xpEarned: p.xpEarned,
        completedAt: p.completedAt,
      })));
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      // Set empty progress on error
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
          >
            <FaUser className="w-4 h-4" />
            Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const totalXP = user?.xp || 0;
  const level = user?.level || 1;
  // Each level requires 100 XP
  // XP needed for current level: (level - 1) * 100
  // XP needed for next level: level * 100
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - totalXP;
  const xpProgress = Math.min(xpInCurrentLevel / 100, 1); // Progress within current level (0-1)

  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const inProgressCount = progress.filter((p) => p.status === 'in_progress').length;
  const totalEarnedXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium text-sm group"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 lg:p-10 mb-8 shadow-2xl overflow-hidden relative"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                
                {/* User Info */}
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {user?.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                    {user?.email}
                  </p>
                  {user?.username && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Level Badge */}
              <div className="flex flex-col items-end">
                <div className="px-6 py-3 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                  <div className="text-3xl font-bold">Level {level}</div>
                  <div className="text-sm opacity-90">{formatXP(totalXP)} XP</div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <span className="flex items-center gap-2">
                  <FaStar className="w-4 h-4 text-yellow-500" />
                  Progress to Level {level + 1}
                </span>
                <span>{xpInCurrentLevel} / 100 XP</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                {xpNeededForNextLevel > 0 ? (
                  <span>{xpNeededForNextLevel} XP needed to reach Level {level + 1}</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-semibold">Ready to level up!</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">{completedCount}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                    <FaClock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{inProgressCount}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <FaAward className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalEarnedXP}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">XP Earned</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 lg:p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <FaTrophy className="text-yellow-500" />
                Achievements
              </h2>
              <Link
                to="/achievements"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                View All
                <FaArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
            <AchievementList />
          </motion.div>

          {/* Learning Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 lg:p-8 shadow-xl"
          >
            <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-6">
              <FaChartLine className="text-indigo-500" />
              Learning Progress
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : progress.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No progress yet. Start exploring concepts!
                </p>
                <Link
                  to="/concepts"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                >
                  Browse Concepts
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {progress.map((item, index) => (
                  <motion.div
                    key={item.conceptId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="glass-card p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.conceptTitle}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === 'completed'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : item.status === 'in_progress'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {item.status === 'completed' && <FaCheckCircle className="inline w-3 h-3 mr-1" />}
                            {item.status === 'in_progress' && <FaClock className="inline w-3 h-3 mr-1" />}
                            {item.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {item.xpEarned} XP
                          </span>
                          {item.completedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(item.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/concept/${item.conceptId}`}
                        className="px-4 py-2 text-sm font-semibold bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        View
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

