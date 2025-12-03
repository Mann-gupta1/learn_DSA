import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { apiService } from '../services/api';
import type { Concept } from '../types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Concept[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length > 0) {
      searchConcepts();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchConcepts = async () => {
    try {
      const response = await apiService.getConcepts();
      const allConcepts = response.concepts as any[];
      
      // Flatten hierarchical structure
      const flattenConcepts = (concepts: any[]): Concept[] => {
        let flat: Concept[] = [];
        concepts.forEach((concept) => {
          flat.push(concept);
          if (concept.children) {
            flat = flat.concat(flattenConcepts(concept.children));
          }
        });
        return flat;
      };

      const flatConcepts = flattenConcepts(allConcepts);
      
      // Simple fuzzy search
      const searchTerm = query.toLowerCase();
      const filtered = flatConcepts.filter(
        (concept) =>
          concept.title.toLowerCase().includes(searchTerm) ||
          concept.description.toLowerCase().includes(searchTerm) ||
          concept.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
      
      setResults(filtered.slice(0, 5));
      setIsOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSelect = (concept: Concept) => {
    navigate(`/concept/${concept.slug}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search concepts..."
          className="w-full pl-10 pr-4 py-2 rounded-lg glass-card border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isOpen && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 w-full glass-card rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {results.map((concept) => (
            <button
              key={concept.id}
              onClick={() => handleSelect(concept)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="font-semibold text-gray-900 dark:text-white">{concept.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                {concept.description}
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {isOpen && query && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 w-full glass-card rounded-lg shadow-xl z-50 p-4 text-center text-gray-500"
        >
          No results found
        </motion.div>
      )}
    </div>
  );
}

