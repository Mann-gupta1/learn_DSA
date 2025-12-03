// API service for communicating with backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token from store
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText}`;
        
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If response is not JSON, use status text
        }

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request failed:', error);
      
      // Re-throw with more context if it's a network error
      if (error.message === 'Failed to fetch' || error.message === 'NetworkError') {
        throw new Error('Cannot connect to backend server. Make sure the backend is running on http://localhost:5000. Check the console for more details.');
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health');
  }

  // Concepts
  async getConcepts() {
    return this.request<{ concepts: unknown[] }>('/concepts');
  }

  async getConceptById(id: string) {
    return this.request<{ concept: unknown }>(`/concepts/${id}`);
  }

  async getConceptBySlug(slug: string) {
    return this.request<{ concept: unknown }>(`/concepts/slug/${slug}`);
  }

  // Articles
  async getArticleByConceptId(conceptId: string) {
    return this.request<{ article: unknown }>(`/articles/concept/${conceptId}`);
  }

  // Code execution
  async executeCode(data: { code: string; language: 'python' | 'cpp' | 'javascript'; input?: string }) {
    return this.request<{ run: unknown }>('/code/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Authentication
  async register(data: { name: string; username: string; email: string; password: string }) {
    return this.request<{ user: unknown; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { emailOrUsername: string; password: string }) {
    return this.request<{ user: unknown; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: unknown }>('/auth/me');
  }

  // FAQs
  async getFAQsByConceptId(conceptId: string) {
    return this.request<{ faqs: unknown[] }>(`/faqs/concept/${conceptId}`);
  }

  async searchFAQs(query: string, conceptId?: string) {
    const params = new URLSearchParams({ q: query });
    if (conceptId) params.append('conceptId', conceptId);
    return this.request<{ faqs: unknown[] }>(`/faqs/search?${params.toString()}`);
  }

  // Progress
  async getUserProgress() {
    return this.request<{ progress: unknown[] }>('/progress');
  }

  async getProgressByConceptId(conceptId: string) {
    return this.request<{ progress: unknown }>(`/progress/${conceptId}`);
  }

  async updateProgress(data: {
    conceptId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    xpEarned?: number;
  }) {
    return this.request<{ progress: unknown }>('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Practice Problems
  async getProblems(conceptId?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (conceptId) params.append('conceptId', conceptId);
    if (difficulty) params.append('difficulty', difficulty);
    const query = params.toString();
    return this.request<{ problems: unknown[] }>(`/practice${query ? `?${query}` : ''}`);
  }

  async getProblemById(id: string) {
    return this.request<{ problem: unknown }>(`/practice/${id}`);
  }

  async submitSolution(problemId: string, data: { code: string; language: 'python' | 'cpp' | 'javascript' }) {
    return this.request<{ passed: boolean; message: string; testResults: unknown[] }>(
      `/practice/${problemId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Leaderboard
  async getLeaderboard(filter: 'all' | 'weekly' | 'monthly' = 'all') {
    return this.request<{ leaderboard: unknown[] }>(`/leaderboard?filter=${filter}`);
  }

  // Visualizations
  async getVisualizations(conceptId?: string) {
    const query = conceptId ? `?conceptId=${conceptId}` : '';
    return this.request<{ visualizations: unknown[] }>(`/visualizations${query}`);
  }

  async getVisualizationById(id: string) {
    return this.request<{ visualization: unknown }>(`/visualizations/${id}`);
  }

  async getVisualizationsByConceptId(conceptId: string) {
    return this.request<{ visualizations: unknown[] }>(`/visualizations/concept/${conceptId}`);
  }

  // Bookmarks
  async getBookmarks() {
    return this.request<{ bookmarks: unknown[] }>('/bookmarks');
  }

  async addBookmark(conceptId: string) {
    return this.request<{ bookmark: unknown }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ conceptId }),
    });
  }

  async removeBookmark(conceptId: string) {
    return this.request<{ success: boolean }>(`/bookmarks/${conceptId}`, {
      method: 'DELETE',
    });
  }

  // Achievements
  async getUserAchievements() {
    return this.request<{ achievements: unknown[]; earnedAchievements: string[] }>('/achievements');
  }

  // Chatbot
  async chat(data: {
    question: string;
    conceptId?: string;
    url?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    return this.request<{
      response: string;
      contextUsed: string;
      hasContext: boolean;
      conceptId: string | null;
    }>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();

