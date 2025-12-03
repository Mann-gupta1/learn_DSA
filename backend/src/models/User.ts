// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  xp: number;
  level: number;
  badges: string[]; // Array of badge IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  badges: string[];
}

export interface Progress {
  userId: string;
  conceptId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: Date;
  xpEarned: number;
  lastAccessedAt: Date;
}

