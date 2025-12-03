# DSA Learning Platform

A comprehensive Data Structures and Algorithms learning platform with interactive code execution, visualizations, practice problems, and gamification features.

## 🎯 Overview

This platform provides an interactive learning environment for mastering Data Structures and Algorithms. It combines theoretical learning with hands-on practice through code execution, visualizations, and a gamified progress tracking system.

## ✨ Features

### Core Learning Features
- **Concept Explorer**: Browse and learn DSA concepts with hierarchical organization
- **Interactive Articles**: Markdown-based content with syntax highlighting
- **Code Playground**: Execute code in multiple languages (Python, C++, JavaScript, Go) with real-time output
- **Code History**: Track and review your past code executions
- **Practice Problems**: Solve problems with varying difficulty levels (Easy, Medium, Hard)
- **Visualizations**: Interactive 3D and 2D visualizations of data structures and algorithms
  - Built with React Three Fiber for 3D visualizations
  - D3.js and Recharts for data visualization
- **FAQs**: Frequently asked questions for each concept

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Progress Tracking**: Monitor your learning progress with XP and leveling system
- **Achievements**: Unlock achievements as you progress
- **Leaderboard**: Compete with other learners
- **Bookmarks**: Save important concepts for quick access
- **User Profile**: Customize your profile and view statistics
- **Theme Support**: Light, dark, and system theme preferences

### Technical Features
- **Multi-language Code Execution**: 
  - Python (Python 3)
  - C++ (g++ or MSVC)
  - JavaScript (Node.js)
  - Go (Go compiler)
- **Code Sanitization**: Security measures to prevent dangerous code execution
- **Timeout Protection**: Automatic timeout for long-running code
- **Real-time Feedback**: Instant execution results and error messages

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Code Execution**: Child process execution with timeout and security controls

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand
- **Routing**: React Router DOM 7
- **Code Editor**: Monaco Editor (VS Code editor)
- **3D Visualizations**: React Three Fiber + Drei
- **Charts**: Recharts
- **Data Visualization**: D3.js
- **Animations**: Framer Motion
- **Markdown**: React Markdown with syntax highlighting

### Infrastructure
- **Database**: PostgreSQL (Docker container)
- **Containerization**: Docker Compose


## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (or use Docker Compose)
- **npm** or **yarn**
- **Code Compilers** (optional, for code execution):
  - Python 3
  - C++ compiler (g++ or MSVC)
  - Node.js (for JavaScript)
  - Go compiler (optional, for Go support)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "coding project"
   ```

2. **Set up the database**
   
   Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d
   ```
   
   Or use your own PostgreSQL instance and update the connection string.

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="url of the database"
   JWT_SECRET="your-secret-key-here"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Set up the database schema**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Concepts
- `GET /api/concepts` - Get all concepts
- `GET /api/concepts/:id` - Get concept by ID
- `GET /api/concepts/slug/:slug` - Get concept by slug

### Articles
- `GET /api/articles/:conceptId` - Get article for a concept

### Code Execution
- `POST /api/code/run` - Execute code
- `GET /api/code/history` - Get user's code history (protected)
- `GET /api/code/history/:id` - Get specific code run (protected)

### Practice Problems
- `GET /api/practice` - Get all practice problems
- `GET /api/practice/:conceptId` - Get problems for a concept
- `GET /api/practice/problem/:id` - Get specific problem

### Progress
- `GET /api/progress` - Get user progress (protected)
- `POST /api/progress` - Update progress (protected)

### Visualizations
- `GET /api/visualizations` - Get all visualizations
- `GET /api/visualizations/:id` - Get specific visualization

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements (protected)

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks (protected)
- `POST /api/bookmarks` - Add bookmark (protected)
- `DELETE /api/bookmarks/:id` - Remove bookmark (protected)

### FAQs
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/:conceptId` - Get FAQs for a concept

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User**: User accounts with XP, level, and theme preferences
- **Concept**: DSA concepts with hierarchical relationships
- **Article**: Markdown content for concepts
- **Visualization**: Interactive visualization configurations
- **PracticeProblem**: Coding problems with test cases
- **CodeRun**: User code execution history
- **Progress**: User learning progress tracking
- **Bookmark**: User bookmarked concepts
- **Achievement**: Achievement definitions
- **UserAchievement**: User-earned achievements
- **FAQ**: Frequently asked questions


### Adding New Concepts

1. Use the Prisma seed scripts or add concepts directly to the database
2. Concepts support hierarchical organization via `parentId`
3. Each concept can have associated articles, visualizations, FAQs, and practice problems

### Code Execution Security

The code executor includes security measures:
- Code sanitization to block dangerous operations
- Timeout protection (default 10 seconds)
- Output truncation (max 10,000 characters)
- File system isolation in temp directories
- Automatic cleanup of temporary files




**Happy Learning! 🚀**

