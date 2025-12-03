import { create } from 'zustand';
import { apiService } from '../services/api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'code' | 'learning' | 'visualization' | 'milestone';
  earnedAt?: string | null;
  xpReward: number;
  earned?: boolean;
}

interface AchievementState {
  achievements: Achievement[];
  earnedAchievements: string[];
  loading: boolean;
  fetchAchievements: () => Promise<void>;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  earnedAchievements: [],
  loading: false,

  fetchAchievements: async () => {
    try {
      set({ loading: true });
      const response = await apiService.getUserAchievements();
      const achievements = (response.achievements || []) as Achievement[];
      const earnedAchievements = (response.earnedAchievements || []) as string[];
      set({ achievements, earnedAchievements, loading: false });
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      set({ loading: false, achievements: [], earnedAchievements: [] });
    }
  },

  getUnlockedAchievements: () => {
    const { achievements, earnedAchievements } = get();
    return achievements.filter((a) => a.earned || earnedAchievements.includes(a.id));
  },

  getLockedAchievements: () => {
    const { achievements, earnedAchievements } = get();
    return achievements.filter((a) => !a.earned && !earnedAchievements.includes(a.id));
  },
}));

