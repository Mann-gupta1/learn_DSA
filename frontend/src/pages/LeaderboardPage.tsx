import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { formatXP } from '../utils/formatters';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  badges: number;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLeaderboard(filter);
      const fetchedLeaderboard = (response.leaderboard || []) as LeaderboardEntry[];
      
      // Add current user if not in top results
      if (user && !fetchedLeaderboard.some((e) => e.userId === user.id)) {
        // Find user's rank by comparing XP
        let userRank = fetchedLeaderboard.length + 1;
        for (let i = 0; i < fetchedLeaderboard.length; i++) {
          if (user.xp > fetchedLeaderboard[i].xp) {
            userRank = i + 1;
            break;
          }
        }
        
        fetchedLeaderboard.push({
          rank: userRank,
          userId: user.id,
          name: user.name,
          xp: user.xp,
          level: user.level,
          badges: user.badges?.length || 0,
        });
        
        // Re-sort by XP descending
        fetchedLeaderboard.sort((a, b) => b.xp - a.xp);
        // Update ranks
        fetchedLeaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });
      }
      
      setLeaderboard(fetchedLeaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Show empty state instead of mock data
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <FaMedal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <FaAward className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top learners ranked by XP and achievements
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <span className="text-sm font-medium">Filter:</span>
          {(['all', 'weekly', 'monthly'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${getRankColor(entry.rank)} rounded-xl p-6 text-center text-white ${
                      idx === 1 ? 'scale-110' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">
                      {getRankIcon(entry.rank)}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{entry.name}</h3>
                    <p className="text-sm opacity-90">
                      Level {entry.level} • {formatXP(entry.xp)} XP
                    </p>
                    <p className="text-xs mt-2 opacity-75">{entry.badges} badges</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-2">
              {leaderboard.slice(3).map((entry, index) => {
                const isCurrentUser = user && entry.userId === user.id;
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className={`glass-card p-4 rounded-lg ${
                      isCurrentUser
                        ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                          #{entry.rank}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                                (You)
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Level {entry.level}</span>
                          <span>•</span>
                          <span>{formatXP(entry.xp)} XP</span>
                          <span>•</span>
                          <span>{entry.badges} badges</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((entry.xp / 2500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

