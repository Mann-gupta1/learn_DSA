import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import type { Concept, Article, Visualization } from '../types';
import ArticleContent from '../components/ArticleContent';
import BookmarkButton from '../components/BookmarkButton';
import ArrayVisualizer from '../visualizations/ArrayVisualizer';
import TreeVisualizer from '../visualizations/TreeVisualizer';
import StackQueueVisualizer from '../visualizations/StackQueueVisualizer';
import GraphVisualizer from '../visualizations/GraphVisualizer';
import AlgorithmVisualizer from '../visualizations/AlgorithmVisualizer';
import { 
  FaChevronLeft, 
  FaChevronRight,
  FaCode, 
  FaEye, 
  FaRocket,
  FaChartLine
} from 'react-icons/fa';

interface ConceptWithChildren extends Concept {
  children?: ConceptWithChildren[];
}

export default function ConceptDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [concept, setConcept] = useState<Concept | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextConcept, setNextConcept] = useState<Concept | null>(null);
  const [prevConcept, setPrevConcept] = useState<Concept | null>(null);

  useEffect(() => {
    // Reset state when slug or location changes
    setConcept(null);
    setArticle(null);
    setVisualizations([]);
    setNextConcept(null);
    setPrevConcept(null);
    setError(null);
    setLoading(true);

    if (slug) {
      // Use a small delay to ensure state is reset before fetching
      const timer = setTimeout(() => {
        fetchConceptData();
        fetchAllConcepts();
      }, 0);

      return () => {
        clearTimeout(timer);
        setLoading(false);
      };
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, location.pathname]);

  // Extract language from slug (e.g., "python-basics" -> "python", "cpp-arrays" -> "cpp")
  const getLanguageFromSlug = (slug: string): string | null => {
    const slugLower = slug.toLowerCase();
    if (slugLower.startsWith('python-') || slugLower === 'python') return 'python';
    if (slugLower.startsWith('cpp-') || slugLower === 'cpp' || slugLower.startsWith('c++-')) return 'cpp';
    if (slugLower.startsWith('javascript-') || slugLower === 'javascript' || slugLower.startsWith('js-')) return 'javascript';
    if (slugLower.startsWith('go-') || slugLower === 'go') return 'go';
    return null;
  };

  // Flatten hierarchical concepts to a flat list
  const flattenConcepts = (concepts: ConceptWithChildren[]): Concept[] => {
    let flat: Concept[] = [];
    concepts.forEach((concept) => {
      flat.push(concept);
      if (concept.children) {
        flat = flat.concat(flattenConcepts(concept.children));
      }
    });
    return flat;
  };

  // Fetch all concepts to determine next/previous
  const fetchAllConcepts = async () => {
    if (!slug) return;
    
    const currentSlug = slug; // Capture current slug to prevent race conditions
    const currentLanguage = getLanguageFromSlug(currentSlug);
    
    try {
      const response = await apiService.getConcepts();
      const allConcepts = response.concepts as ConceptWithChildren[];
      const flatConcepts = flattenConcepts(allConcepts);
      
      // Filter concepts by the same language as current concept
      let filteredConcepts = flatConcepts;
      if (currentLanguage) {
        filteredConcepts = flatConcepts.filter(c => {
          const conceptLanguage = getLanguageFromSlug(c.slug);
          return conceptLanguage === currentLanguage;
        });
      }
      
      // Find current concept index in filtered list
      const currentIndex = filteredConcepts.findIndex(c => c.slug === currentSlug);
      
      // Always check if slug matches before updating (prevent race conditions)
      if (currentSlug !== slug) {
        return; // Slug changed, abort
      }
      
      if (currentIndex !== -1) {
        // Set next concept (only from same language)
        if (currentIndex < filteredConcepts.length - 1) {
          setNextConcept(filteredConcepts[currentIndex + 1]);
        } else {
          setNextConcept(null);
        }
        
        // Set previous concept (only from same language)
        if (currentIndex > 0) {
          setPrevConcept(filteredConcepts[currentIndex - 1]);
        } else {
          setPrevConcept(null);
        }
      } else {
        // Current concept not found in filtered list (might be language-agnostic)
        // Fallback to all concepts
        const allIndex = flatConcepts.findIndex(c => c.slug === currentSlug);
        if (allIndex !== -1 && currentSlug === slug) {
          if (allIndex < flatConcepts.length - 1) {
            setNextConcept(flatConcepts[allIndex + 1]);
          } else {
            setNextConcept(null);
          }
          if (allIndex > 0) {
            setPrevConcept(flatConcepts[allIndex - 1]);
          } else {
            setPrevConcept(null);
          }
        } else {
          // Concept not found at all
          setNextConcept(null);
          setPrevConcept(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch all concepts for navigation:', err);
      setNextConcept(null);
      setPrevConcept(null);
    }
  };

  const fetchConceptData = async () => {
    if (!slug) return;
    
    const currentSlug = slug; // Capture current slug to prevent race conditions
    
    try {
      setLoading(true);
      const conceptResponse = await apiService.getConceptBySlug(currentSlug);
      const concept = conceptResponse.concept as Concept;
      
      // Check if slug changed during fetch
      if (currentSlug !== slug) {
        return; // Slug changed, abort
      }
      
      setConcept(concept);

      // Fetch article (might not exist for all concepts)
      try {
        const articleResponse = await apiService.getArticleByConceptId(concept.id);
        if (currentSlug === slug) {
          setArticle(articleResponse.article as Article);
        }
      } catch (articleErr) {
        // Article not found is okay, some concepts might not have articles yet
        console.log('Article not found for concept:', concept.id);
        if (currentSlug === slug) {
          setArticle(null);
        }
      }

      // Fetch visualizations for this concept
      try {
        const vizResponse = await apiService.getVisualizationsByConceptId(concept.id);
        const vizList = (vizResponse.visualizations || []) as Visualization[];
        if (currentSlug === slug) {
          setVisualizations(vizList);
        }
      } catch (vizErr) {
        console.log('Visualizations not found for concept:', concept.id, vizErr);
        if (currentSlug === slug) {
          setVisualizations([]);
        }
      }

      if (currentSlug === slug) {
        setError(null);
      }
    } catch (err) {
      if (currentSlug === slug) {
        setError('Failed to load concept');
        console.error(err);
      }
    } finally {
      if (currentSlug === slug) {
        setLoading(false);
      }
    }
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

  const renderVisualization = (viz: Visualization) => {
    // Backend returns 'config' field, frontend type has 'configJson'
    // Handle both naming conventions
    const config = (viz as any).config || (viz.configJson as any) || {};
    
    // For ALL algorithm concepts, use AlgorithmVisualizer which shows step-by-step execution
    const slug = concept?.slug || '';
    const title = concept?.title.toLowerCase() || '';
    
    // Detect all algorithm types
    const shouldUseAlgorithmViz = 
      slug.includes('sort') || 
      slug.includes('bubble') || 
      slug.includes('selection') || 
      slug.includes('insertion') || 
      slug.includes('merge') || 
      slug.includes('quick') || 
      slug.includes('heap') ||
      slug.includes('bfs') ||
      slug.includes('dfs') ||
      slug.includes('breadth-first') ||
      slug.includes('depth-first') ||
      slug.includes('dijkstra') ||
      slug.includes('recursion') ||
      slug.includes('recursive') ||
      slug.includes('tree') && (slug.includes('traversal') || slug.includes('preorder') || slug.includes('inorder') || slug.includes('postorder') || slug.includes('insert') || slug.includes('delete') || slug.includes('remove')) ||
      slug.includes('graph') && (slug.includes('insert') || slug.includes('delete') || slug.includes('remove') || slug.includes('bfs') || slug.includes('dfs')) ||
      slug.includes('array') ||
      slug.includes('dynamic-programming') ||
      slug.includes('greedy') ||
      slug.includes('backtracking') ||
      title.includes('algorithm') ||
      title.includes('sort') ||
      title.includes('search') ||
      title.includes('traversal');
    
    if (shouldUseAlgorithmViz && concept) {
      const arrayData = (config.data as number[]) || [64, 34, 25, 12, 22, 11, 90];
      return (
        <AlgorithmVisualizer
          key={viz.id}
          conceptSlug={concept.slug}
          conceptTitle={concept.title}
          initialData={arrayData}
        />
      );
    }
    
    switch (viz.type) {
      case 'array':
        const arrayData = (config.data as number[]) || [64, 34, 25, 12, 22, 11, 90];
        // Always use AlgorithmVisualizer for algorithm concepts
        if (concept) {
          return (
            <AlgorithmVisualizer
              key={viz.id}
              conceptSlug={concept.slug}
              conceptTitle={concept.title}
              initialData={arrayData}
            />
          );
        }
        return (
          <ArrayVisualizer
            key={viz.id}
            data={arrayData}
            onDataChange={() => {}}
            showControls={false}
          />
        );
      case 'tree':
        return (
          <TreeVisualizer
            key={viz.id}
            root={config.root as any}
            onNodeClick={() => {}}
          />
        );
      case 'stack':
        return (
          <StackQueueVisualizer
            key={viz.id}
            type="stack"
          />
        );
      case 'queue':
        return (
          <StackQueueVisualizer
            key={viz.id}
            type="queue"
          />
        );
      case 'graph':
        return (
          <GraphVisualizer
            key={viz.id}
            onNodeClick={() => {}}
          />
        );
      default:
        // Default: Always try AlgorithmVisualizer for any concept
        if (concept) {
          const arrayData = (config.data as number[]) || [64, 34, 25, 12, 22, 11, 90];
          return (
            <AlgorithmVisualizer
              key={viz.id}
              conceptSlug={concept.slug}
              conceptTitle={concept.title}
              initialData={arrayData}
            />
          );
        }
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Visualization type "{viz.type}" not supported
          </div>
        );
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-6 text-lg text-gray-700 dark:text-gray-300">Loading concept...</p>
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Concept not found'}
            </h2>
            <Link
              to="/concepts"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
              Back to Concepts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/concepts"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium text-sm group"
          >
            <FaChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Concepts
          </Link>
        </motion.div>

        {/* Concept Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 lg:p-10 mb-10 shadow-2xl"
        >
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
                      {concept.title}
                    </h1>
                    <BookmarkButton concept={concept} />
                  </div>
                  {concept.description && (
                    <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
                      {concept.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags and Difficulty */}
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                {concept.difficulty && (
                  <span
                    className={`px-5 py-2.5 rounded-full text-sm font-bold border shadow-sm ${getDifficultyColor(concept.difficulty)}`}
                  >
                    {concept.difficulty.charAt(0).toUpperCase() + concept.difficulty.slice(1)}
                  </span>
                )}
                {(concept.tags && concept.tags.length > 0) && (
                  <>
                    {concept.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/playground?concept=${concept.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:scale-105"
                >
                  <FaCode className="w-5 h-5" />
                  Try in Playground
                  <FaRocket className="w-4 h-4" />
                </Link>
                <Link
                  to={`/practice/${concept.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/50 hover:shadow-xl hover:scale-105"
                >
                  <FaChartLine className="w-5 h-5" />
                  Practice Problems
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Article Content and Visualization Sidebar */}
        {article && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Visualization Sidebar - ALWAYS on LEFT side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 order-1"
            >
              <div className="sticky top-24">
                <div className="glass-card rounded-2xl p-4 shadow-xl min-h-[400px] max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-linear-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                      <FaEye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Visualization
                    </h2>
                  </div>
                  {visualizations.length > 0 || concept ? (
                    <div className="space-y-4">
                      {visualizations.length > 0 ? (
                        visualizations.map((viz) => (
                          <div key={viz.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
                            <div className="w-full overflow-hidden">
                              {renderVisualization(viz)}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Auto-generate visualization for algorithm concepts even without DB entry
                        concept && (
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
                            <div className="w-full overflow-hidden">
                              <AlgorithmVisualizer
                                conceptSlug={concept.slug}
                                conceptTitle={concept.title}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FaEye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Visualization will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Article Content - Takes 2 columns on large screens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 order-2"
            >
              <ArticleContent markdown={article.markdown} />
            </motion.div>
          </div>
        )}

        {/* If no article, show visualization in full width */}
        {!article && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-card rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-linear-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                  <FaEye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Visualization
                </h2>
              </div>
              {visualizations.length > 0 || concept ? (
                <div className="space-y-6">
                  {visualizations.length > 0 ? (
                    visualizations.map((viz) => (
                      <div key={viz.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                        {renderVisualization(viz)}
                      </div>
                    ))
                  ) : (
                    // Auto-generate visualization for algorithm concepts even without DB entry
                    concept && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <AlgorithmVisualizer
                          conceptSlug={concept.slug}
                          conceptTitle={concept.title}
                        />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <FaEye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Visualization will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next/Previous Concept Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between gap-4"
        >
          {/* Previous Concept */}
          {prevConcept ? (
            <Link
              to={`/concept/${prevConcept.slug}`}
              onClick={() => {
                // Force navigation by resetting state
                setConcept(null);
                setArticle(null);
                setVisualizations([]);
                setNextConcept(null);
                setPrevConcept(null);
                setLoading(true);
              }}
              className="flex-1 group glass-card rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <FaChevronLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Previous Concept
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {prevConcept.title}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* Next Concept */}
          {nextConcept ? (
            <Link
              to={`/concept/${nextConcept.slug}`}
              onClick={() => {
                // Force navigation by resetting state
                setConcept(null);
                setArticle(null);
                setVisualizations([]);
                setNextConcept(null);
                setPrevConcept(null);
                setLoading(true);
              }}
              className="flex-1 group glass-card rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-right"
            >
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="p-3 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <FaChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Next Concept
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {nextConcept.title}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </motion.div>

      </div>
    </div>
  );
}
