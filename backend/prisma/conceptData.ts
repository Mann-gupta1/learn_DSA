// Comprehensive curriculum data for software engineering

export interface ConceptData {
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  parentSlug?: string;
  tags: string[];
  article: {
    sections: Array<{ heading: string; content: string }>;
  };
  faqs?: Array<{ question: string; answer: string }>;
  practiceProblems?: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    examples: Array<{ input: string; output: string }>;
    hints: string[];
    solution: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  }>;
}

export const curriculum: ConceptData[] = [
  // Programming Fundamentals
  {
    title: 'C++ Programming Fundamentals',
    slug: 'cpp-basics',
    description: 'Master C++ from basics: syntax, data types, control flow, functions, pointers, and memory management',
    difficulty: 'beginner',
    order: 1,
    tags: ['cpp', 'programming', 'basics'],
    article: {
      sections: [
        {
          heading: 'Introduction',
          content: `C++ is a powerful programming language. [Full content with examples...]`
        }
      ]
    }
  },
  // ... will continue with all concepts
];

