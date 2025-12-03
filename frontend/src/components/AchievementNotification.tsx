import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementStore } from '../stores/achievementStore';
import { useToastStore } from '../stores/toastStore';

export default function AchievementNotification() {
  const { achievements, earnedAchievements } = useAchievementStore();
  const { success } = useToastStore();
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [prevEarned, setPrevEarned] = useState<string[]>(earnedAchievements);

  useEffect(() => {
    const currentEarned = earnedAchievements;
    const newlyEarned = currentEarned.find((id) => !prevEarned.includes(id));
    
    if (newlyEarned) {
      const achievement = achievements.find((a) => a.id === newlyEarned);
      if (achievement) {
        setNewAchievement(achievement.id);
        success(`🏆 Achievement Unlocked: ${achievement.name}!`);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setNewAchievement(null);
        }, 5000);
      }
    }
    
    setPrevEarned(currentEarned);
  }, [earnedAchievements, achievements, prevEarned, success]);

  const achievement = newAchievement
    ? achievements.find((a) => a.id === newAchievement)
    : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.5 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-card p-6 rounded-2xl shadow-2xl max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
          }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {achievement.icon}
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
            <p className="text-xl font-semibold text-white mb-1">{achievement.name}</p>
            <p className="text-sm text-indigo-100 mb-3">{achievement.description}</p>
            <div className="inline-block px-4 py-2 bg-white/20 rounded-lg text-white font-semibold">
              +{achievement.xpReward} XP
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

