import { create } from 'zustand';
import { apiService } from '../services/api';

interface Bookmark {
  conceptId: string;
  conceptTitle: string;
  slug: string;
  bookmarkedAt: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  fetchBookmarks: () => Promise<void>;
  addBookmark: (concept: { id: string; title: string; slug: string }) => Promise<void>;
  removeBookmark: (conceptId: string) => Promise<void>;
  isBookmarked: (conceptId: string) => boolean;
  toggleBookmark: (concept: { id: string; title: string; slug: string }) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  loading: false,
  
  fetchBookmarks: async () => {
    try {
      set({ loading: true });
      const response = await apiService.getBookmarks();
      const bookmarks = (response.bookmarks || []) as Bookmark[];
      set({ bookmarks, loading: false });
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      set({ loading: false, bookmarks: [] });
    }
  },
  
  addBookmark: async (concept) => {
    try {
      await apiService.addBookmark(concept.id);
      // Refresh bookmarks from server
      await get().fetchBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },
  
  removeBookmark: async (conceptId) => {
    try {
      await apiService.removeBookmark(conceptId);
      // Refresh bookmarks from server
      await get().fetchBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  },
  
  isBookmarked: (conceptId) => {
    return get().bookmarks.some((b) => b.conceptId === conceptId);
  },
  
  toggleBookmark: async (concept) => {
    if (get().isBookmarked(concept.id)) {
      await get().removeBookmark(concept.id);
    } else {
      await get().addBookmark(concept);
    }
  },
}));

