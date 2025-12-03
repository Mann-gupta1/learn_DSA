import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import conceptRoutes from './routes/conceptRoutes';
import articleRoutes from './routes/articleRoutes';
import codeRoutes from './routes/codeRoutes';
import authRoutes from './routes/authRoutes';
import faqRoutes from './routes/faqRoutes';
import progressRoutes from './routes/progressRoutes';
import practiceRoutes from './routes/practiceRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import visualizationRoutes from './routes/visualizationRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import achievementRoutes from './routes/achievementRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/concepts', conceptRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/visualizations', visualizationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

