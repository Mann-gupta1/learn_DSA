import { create } from 'zustand';

export interface CodeHistoryEntry {
  id: string;
  code: string;
  language: 'python' | 'cpp' | 'javascript' | 'go';
  input?: string;
  output?: string;
  error?: string;
  timestamp: string;
  conceptId?: string;
}

interface CodeHistoryState {
  history: CodeHistoryEntry[];
  addEntry: (entry: Omit<CodeHistoryEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  getRecentEntries: (limit?: number) => CodeHistoryEntry[];
}

const loadHistory = (): CodeHistoryEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('codeHistory');
  return stored ? JSON.parse(stored) : [];
};

const saveHistory = (history: CodeHistoryEntry[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('codeHistory', JSON.stringify(history));
  }
};

export const useCodeHistoryStore = create<CodeHistoryState>((set, get) => ({
  history: loadHistory(),
  addEntry: (entry) => {
    const newEntry: CodeHistoryEntry = {
      ...entry,
      id: `code-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };
    const newHistory = [newEntry, ...get().history].slice(0, 50); // Keep last 50 entries
    set({ history: newHistory });
    saveHistory(newHistory);
  },
  removeEntry: (id) => {
    const newHistory = get().history.filter((e) => e.id !== id);
    set({ history: newHistory });
    saveHistory(newHistory);
  },
  clearHistory: () => {
    set({ history: [] });
    saveHistory([]);
  },
  getRecentEntries: (limit = 10) => {
    return get().history.slice(0, limit);
  },
}));

