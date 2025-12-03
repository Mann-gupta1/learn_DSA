import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { FaChevronDown, FaChevronRight, FaBook, FaCheckCircle } from 'react-icons/fa';
import type { Concept } from '../types';

interface ConceptWithChildren extends Concept {
  children?: ConceptWithChildren[];
}

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideNav({ isOpen, onClose }: SideNavProps) {
  const location = useLocation();
  const [concepts, setConcepts] = useState<ConceptWithChildren[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcepts();
  }, []);

  const fetchConcepts = async () => {
    try {
      const response = await apiService.getConcepts();
      setConcepts(response.concepts as ConceptWithChildren[]);
      // Expand first level by default
      const firstLevelIds = response.concepts.map((c: any) => c.id);
      setExpandedNodes(new Set(firstLevelIds));
    } catch (error) {
      console.error('Failed to fetch concepts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderConceptNode = (concept: ConceptWithChildren, level: number = 0): JSX.Element => {
    const hasChildren = concept.children && concept.children.length > 0;
    const isExpanded = expandedNodes.has(concept.id);
    const isActive = location.pathname === `/concept/${concept.slug}`;
    const indent = level * 20;

    return (
      <div key={concept.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(concept.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <FaChevronDown className="w-3 h-3" />
              ) : (
                <FaChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <Link
            to={`/concept/${concept.slug}`}
            onClick={onClose}
            className="flex-1 flex items-center gap-2"
          >
            <FaBook className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium flex-1">{concept.title}</span>
            {isActive && (
              <FaCheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </Link>
        </div>
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {concept.children!.map((child) => renderConceptNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 glass-card z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold gradient-text">DSA Roadmap</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Beginner
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Intermediate
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Advanced
                  </span>
                </div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <nav className="space-y-1">
                    {concepts.map((concept) => renderConceptNode(concept))}
                  </nav>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/practice"
                    onClick={onClose}
                    className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    Practice Problems
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

