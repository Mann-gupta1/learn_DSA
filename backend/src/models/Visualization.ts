// Visualization Model
export interface VisualizationConfig {
  id: string;
  type: string;
  controls: Array<{
    name: string;
    type: 'slider' | 'input' | 'dropdown' | 'button';
    min?: number;
    max?: number;
    defaultValue?: unknown;
  }>;
  data: unknown;
  animationSteps?: Array<{
    action: string;
    indices?: number[];
    data?: unknown;
    [key: string]: unknown;
  }>;
}

export interface Visualization {
  id: string;
  conceptId: string;
  type: 'array' | 'tree' | 'graph' | 'sorting' | 'recursion' | 'stack' | 'queue' | 'other';
  configJson: VisualizationConfig;
  createdAt: Date;
  updatedAt: Date;
}

