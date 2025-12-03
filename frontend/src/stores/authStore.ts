// Zustand store for authentication

import { create } from 'zustand';
import { apiService } from '../services/api';
import { useBookmarkStore } from './bookmarkStore';
import { useAchievementStore } from './achievementStore';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (emailOrUsername: string, password: string) => {
    const response = await apiService.login({ emailOrUsername, password });
    const user = response.user as User;
    const token = response.token;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
    
    // Fetch user data after login
    const bookmarkStore = useBookmarkStore.getState();
    const achievementStore = useAchievementStore.getState();
    bookmarkStore.fetchBookmarks();
    achievementStore.fetchAchievements();
  },

  register: async (name: string, username: string, email: string, password: string) => {
    const response = await apiService.register({ name, username, email, password });
    const user = response.user as User;
    const token = response.token;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
    
    // Fetch user data after registration
    const bookmarkStore = useBookmarkStore.getState();
    const achievementStore = useAchievementStore.getState();
    bookmarkStore.fetchBookmarks();
    achievementStore.fetchAchievements();
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
}));

