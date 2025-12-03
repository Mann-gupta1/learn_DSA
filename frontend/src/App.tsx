import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import { useAuthInit } from './hooks/useAuthInit';
import { useThemeStore } from './stores/themeStore';
import HomePage from './pages/HomePage';
import ConceptExplorer from './pages/ConceptExplorer';
import ConceptDetail from './pages/ConceptDetail';
import CodePlayground from './pages/CodePlayground';
import VisualizationPage from './pages/VisualizationPage';
import VisualizationShowcase from './pages/VisualizationShowcase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CodeHistoryPage from './pages/CodeHistoryPage';
import AchievementsPage from './pages/AchievementsPage';
import PracticeProblems from './pages/PracticeProblems';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfile from './pages/UserProfile';
import ToastContainer from './components/ToastContainer';
import AchievementNotification from './components/AchievementNotification';

function App() {
  useAuthInit(); // Initialize auth state from localStorage
  const { resolvedTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <>
      <Layout>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/concepts" element={<ConceptExplorer />} />
        <Route path="/concept/:slug" element={<ConceptDetail />} />
        <Route path="/playground" element={<CodePlayground />} />
        <Route path="/history" element={<CodeHistoryPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/practice" element={<PracticeProblems />} />
        <Route path="/practice/:conceptId" element={<PracticeProblems />} />
        <Route path="/visualization/:id" element={<VisualizationPage />} />
        <Route path="/visualizations" element={<VisualizationShowcase />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
        {/* TODO: Add more routes */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        </Routes>
      </Layout>
      <ToastContainer />
      <AchievementNotification />
    </>
  );
}

export default App;
