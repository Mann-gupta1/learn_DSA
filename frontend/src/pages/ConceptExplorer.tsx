import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import type { Concept } from '../types';
import { FaBook, FaChevronRight, FaLayerGroup } from 'react-icons/fa';

interface ConceptWithChildren extends Concept {
  children?: ConceptWithChildren[];
}

export default function ConceptExplorer() {
  const { slug } = useParams();
  const [concepts, setConcepts] = useState<ConceptWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConcepts();
  }, []);

  const fetchConcepts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConcepts();
      setConcepts(response.concepts as ConceptWithChildren[]);
      setError(null);
    } catch (err) {
      setError('Failed to load concepts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (conceptId: string) => {
    const newExpanded = new Set(expandedConcepts);
    if (newExpanded.has(conceptId)) {
      newExpanded.delete(conceptId);
    } else {
      newExpanded.add(conceptId);
    }
    setExpandedConcepts(newExpanded);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'advanced':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
    }
  };

  const renderConceptCard = (concept: ConceptWithChildren, level: number = 0) => {
    const hasChildren = concept.children && concept.children.length > 0;
    const isExpanded = expandedConcepts.has(concept.id);
    const indent = level * 24;

    return (
      <motion.div
        key={concept.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level * 0.05 }}
        className="mb-4"
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="glass-card rounded-xl p-6 lg:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-white/20 dark:border-gray-700/30 group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <Link
                  to={`/concept/${concept.slug}`}
                  className="group/link flex-1"
                >
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors mb-1">
                    {concept.title}
                  </h3>
                </Link>
                {concept.difficulty && (
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getDifficultyColor(concept.difficulty)} whitespace-nowrap shadow-sm`}
                  >
                    {concept.difficulty.charAt(0).toUpperCase() + concept.difficulty.slice(1)}
                  </span>
                )}
              </div>
              
              {concept.description && (
                <p className="text-base text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                  {concept.description}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to={`/concept/${concept.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:scale-105"
                >
                  <FaBook className="w-4 h-4" />
                  Learn More
                  <FaChevronRight className="w-3 h-3" />
                </Link>
                
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(concept.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                  >
                    <FaLayerGroup className="w-4 h-4" />
                    <span>{concept.children!.length} subtopic{concept.children!.length !== 1 ? 's' : ''}</span>
                    <FaChevronRight 
                      className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-4 ml-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
            {concept.children!.map((child) => renderConceptCard(child, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-6 text-lg text-gray-700 dark:text-gray-300">Loading concepts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Concepts</h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchConcepts}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-8 transition-colors font-medium text-sm"
          >
            <FaChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
          
          <div className="glass-card rounded-2xl p-8 lg:p-10 mb-8 shadow-2xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold gradient-text mb-4 leading-tight">
              Concept Explorer
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
              Explore all topics organized hierarchically. Click on any concept to dive deeper into the material.
            </p>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm lg:text-base">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Beginner</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>
                <span className="font-medium text-amber-700 dark:text-amber-400">Intermediate</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></div>
                <span className="font-medium text-rose-700 dark:text-rose-400">Advanced</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Concepts Grid */}
        <div className="space-y-4 lg:space-y-6">
          {concepts.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Concepts Available</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new learning materials!
              </p>
            </div>
          ) : (
            concepts.map((concept) => renderConceptCard(concept))
          )}
        </div>
      </div>
    </div>
  );
}
