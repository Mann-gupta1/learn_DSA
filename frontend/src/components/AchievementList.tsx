import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAchievementStore } from '../stores/achievementStore';
import { useAuthStore } from '../stores/authStore';

export default function AchievementList() {
  const { isAuthenticated } = useAuthStore();
  const { fetchAchievements, getUnlockedAchievements } = useAchievementStore();
  const unlocked = getUnlockedAchievements().slice(0, 6);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAchievements();
    }
  }, [isAuthenticated, fetchAchievements]);

  if (unlocked.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No achievements yet</p>
        <Link
          to="/achievements"
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View all achievements →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {unlocked.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg p-4 text-center"
        >
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
            {achievement.name}
          </div>
        </div>
      ))}
      {unlocked.length >= 6 && (
        <Link
          to="/achievements"
          className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
        >
          <span className="text-sm font-semibold">View All</span>
        </Link>
      )}
    </div>
  );
}

