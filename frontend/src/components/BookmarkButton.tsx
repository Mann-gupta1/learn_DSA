import { motion } from 'framer-motion';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useToastStore } from '../stores/toastStore';

interface BookmarkButtonProps {
  concept: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function BookmarkButton({ concept }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const { success, info } = useToastStore();
  const bookmarked = isBookmarked(concept.id);

  const handleClick = async () => {
    try {
      await toggleBookmark(concept);
      if (bookmarked) {
        info('Bookmark removed');
      } else {
        success('Bookmark added!');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors ${
        bookmarked
          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {bookmarked ? (
        <FaBookmark className="w-5 h-5" />
      ) : (
        <FaRegBookmark className="w-5 h-5" />
      )}
    </motion.button>
  );
}

