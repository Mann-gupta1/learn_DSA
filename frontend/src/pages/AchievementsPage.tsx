import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAchievementStore } from '../stores/achievementStore';
import { useAuthStore } from '../stores/authStore';
import { FaLock, FaUnlock } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AchievementsPage() {
  const { isAuthenticated } = useAuthStore();
  const { achievements, loading, fetchAchievements, getUnlockedAchievements, getLockedAchievements } = useAchievementStore();
  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAchievements();
    }
  }, [isAuthenticated, fetchAchievements]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryColors = {
    code: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    learning: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    visualization: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    milestone: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Achievements</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and unlock badges as you learn
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Unlocked: </span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {unlocked.length} / {achievements.length}
              </span>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements */}
        {unlocked.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaUnlock className="text-green-600" />
              Unlocked Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlocked.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:scale-105 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  }}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[achievement.category]}`}
                      >
                        {achievement.category}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaLock className="text-gray-400" />
              Locked Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl opacity-60"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3 grayscale">{achievement.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[achievement.category]}`}
                      >
                        {achievement.category}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

