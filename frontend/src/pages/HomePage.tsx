import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { FaRocket, FaBook, FaCode, FaEye, FaChartLine } from 'react-icons/fa';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold gradient-text mb-4">
            🧭 Interactive Coding & DSA Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn coding and data structures through live code execution, 
            interactive animations, and visual feedback
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-5xl mb-5">📚</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Learn by Reading</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Rich, interactive articles explaining theory and code
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-5xl mb-5">👁️</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Learn by Seeing</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Dynamic visualizers show how algorithms behave step by step
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="text-5xl mb-5">🛠️</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Learn by Doing</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Built-in compiler and playground to run & modify code
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50"
            >
              <FaChartLine />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50"
            >
              Get Started
            </Link>
          )}
          <Link
            to="/concepts"
            className="inline-flex items-center gap-2 glass-card px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 transition-all"
          >
            <FaBook />
            Explore Concepts
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid md:grid-cols-4 gap-4 max-w-6xl mx-auto"
        >
          <Link
            to="/concepts"
            className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
          >
            <FaBook className="text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Concepts</h3>
          </Link>
          <Link
            to="/playground"
            className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
          >
            <FaCode className="text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Playground</h3>
          </Link>
          <Link
            to="/visualizations"
            className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
          >
            <FaEye className="text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Visualizations</h3>
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
            >
              <FaChartLine className="text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Dashboard</h3>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}

