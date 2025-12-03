import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { FaChevronDown, FaChevronRight, FaBook, FaCheckCircle } from 'react-icons/fa';
import type { Concept } from '../types';

interface ConceptWithChildren extends Concept {
  children?: ConceptWithChildren[];
}

export default function DesktopSideNav() {
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
    const indent = level * 16;

    return (
      <div key={concept.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors mx-2 ${
            isActive
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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
            className="flex-1 flex items-center gap-2 text-sm"
          >
            <FaBook className="w-3 h-4 text-gray-400" />
            <span className="font-medium flex-1 truncate">{concept.title}</span>
            {isActive && (
              <FaCheckCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            )}
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {concept.children!.map((child) => renderConceptNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold gradient-text mb-2">DSA Roadmap</h2>
        <div className="flex gap-1 flex-wrap text-xs">
          <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Beginner
          </span>
          <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Intermediate
          </span>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Advanced
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <nav className="space-y-1">
          {concepts.map((concept) => renderConceptNode(concept))}
        </nav>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          to="/dashboard"
          className="block px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm"
        >
          Dashboard
        </Link>
        <Link
          to="/practice"
          className="block px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center text-sm"
        >
          Practice
        </Link>
        <Link
          to="/achievements"
          className="block px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center text-sm"
        >
          Achievements
        </Link>
      </div>
    </div>
  );
}

