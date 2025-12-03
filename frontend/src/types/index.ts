// Core types for the platform

export interface Concept {
  id: string;
  title: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  description: string;
  parentId?: string; // For hierarchical structure
  children?: Concept[];
}

export interface Article {
  id: string;
  conceptId: string;
  markdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visualization {
  id: string;
  conceptId: string;
  type: 'array' | 'tree' | 'graph' | 'sorting' | 'recursion' | 'stack' | 'queue' | 'other';
  configJson: VisualizationConfig;
  createdAt: string;
}

export interface VisualizationConfig {
  id: string;
  type: string;
  controls: Control[];
  data: unknown;
  animationSteps?: AnimationStep[];
}

export interface Control {
  name: string;
  type: 'slider' | 'input' | 'dropdown' | 'button';
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

export interface AnimationStep {
  action: 'compare' | 'swap' | 'highlight' | 'move' | 'insert' | 'delete';
  indices?: number[];
  data?: unknown;
  [key: string]: unknown;
}

export interface CodeSnippet {
  id: string;
  conceptId: string;
  language: 'python' | 'cpp' | 'javascript';
  code: string;
  description?: string;
}

export interface FAQ {
  id: string;
  conceptId: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface CodeRun {
  id: string;
  userId?: string;
  code: string;
  language: 'python' | 'cpp' | 'javascript';
  input: string;
  output: string;
  error?: string;
  traceJson?: AnimationStep[]; // For visualization events
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  earnedAt: string;
}

export interface Progress {
  userId: string;
  conceptId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  xpEarned: number;
}

