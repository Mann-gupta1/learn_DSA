import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface ConceptData {
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

// Helper to determine difficulty from content
function determineDifficulty(title: string, content: string): 'beginner' | 'intermediate' | 'advanced' {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  if (lowerTitle.includes('basic') || lowerTitle.includes('introduction') || 
      lowerTitle.includes('fundamental') || lowerContent.includes('beginner')) {
    return 'beginner';
  }
  if (lowerTitle.includes('advanced') || lowerContent.includes('advanced') || 
      lowerContent.includes('complex')) {
    return 'advanced';
  }
  return 'intermediate';
}

// Helper to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fetch article content from GeeksforGeeks
async function fetchArticleContent(url: string): Promise<{ sections: Array<{ heading: string; content: string }> }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const sections: Array<{ heading: string; content: string }> = [];
    
    // Try to find main content
    const mainContent = $('article, .content, .entry-content, .post-content, main').first();
    
    if (mainContent.length > 0) {
      mainContent.find('h1, h2, h3, h4, p, pre, ul, ol').each((_, element) => {
        const $el = $(element);
        const tagName = element.tagName.toLowerCase();
        
        if (tagName.startsWith('h')) {
          const heading = $el.text().trim();
          if (heading) {
            sections.push({ heading, content: '' });
          }
        } else if (tagName === 'p' || tagName === 'ul' || tagName === 'ol') {
          const content = $el.text().trim();
          if (content && sections.length > 0) {
            sections[sections.length - 1].content += content + '\n\n';
          } else if (content) {
            sections.push({ heading: 'Introduction', content: content + '\n\n' });
          }
        } else if (tagName === 'pre') {
          const code = $el.text().trim();
          if (code && sections.length > 0) {
            sections[sections.length - 1].content += '```\n' + code + '\n```\n\n';
          }
        }
      });
    } else {
      // Fallback: get all paragraphs and headings
      $('h1, h2, h3, p').each((_, element) => {
        const $el = $(element);
        const tagName = element.tagName.toLowerCase();
        const text = $el.text().trim();
        
        if (tagName.startsWith('h') && text) {
          sections.push({ heading: text, content: '' });
        } else if (tagName === 'p' && text) {
          if (sections.length > 0) {
            sections[sections.length - 1].content += text + '\n\n';
          } else {
            sections.push({ heading: 'Introduction', content: text + '\n\n' });
          }
        }
      });
    }
    
    // Clean up sections
    return {
      sections: sections
        .filter(s => s.heading || s.content.trim())
        .map(s => ({
          heading: s.heading || 'Content',
          content: s.content.trim() || 'Content from GeeksforGeeks'
        }))
    };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return {
      sections: [{ heading: 'Introduction', content: 'Content could not be fetched from GeeksforGeeks.' }]
    };
  }
}

// Fetch topics from GeeksforGeeks main categories
async function fetchGeeksforGeeksTopics(): Promise<ConceptData[]> {
  const concepts: ConceptData[] = [];
  let order = 1;

  // DSA Topics from GeeksforGeeks
  const dsaTopics = [
    { title: 'Arrays', url: 'https://www.geeksforgeeks.org/array-data-structure/' },
    { title: 'Linked List', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/' },
    { title: 'Stack', url: 'https://www.geeksforgeeks.org/stack-data-structure/' },
    { title: 'Queue', url: 'https://www.geeksforgeeks.org/queue-data-structure/' },
    { title: 'Binary Tree', url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/' },
    { title: 'Binary Search Tree', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/' },
    { title: 'Heap', url: 'https://www.geeksforgeeks.org/heap-data-structure/' },
    { title: 'Graph', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/' },
    { title: 'Hash Table', url: 'https://www.geeksforgeeks.org/hashing-data-structure/' },
    { title: 'Bubble Sort', url: 'https://www.geeksforgeeks.org/bubble-sort/' },
    { title: 'Selection Sort', url: 'https://www.geeksforgeeks.org/selection-sort/' },
    { title: 'Insertion Sort', url: 'https://www.geeksforgeeks.org/insertion-sort/' },
    { title: 'Merge Sort', url: 'https://www.geeksforgeeks.org/merge-sort/' },
    { title: 'Quick Sort', url: 'https://www.geeksforgeeks.org/quick-sort/' },
    { title: 'Heap Sort', url: 'https://www.geeksforgeeks.org/heap-sort/' },
    { title: 'Counting Sort', url: 'https://www.geeksforgeeks.org/counting-sort/' },
    { title: 'Radix Sort', url: 'https://www.geeksforgeeks.org/radix-sort/' },
    { title: 'Linear Search', url: 'https://www.geeksforgeeks.org/linear-search/' },
    { title: 'Binary Search', url: 'https://www.geeksforgeeks.org/binary-search/' },
    { title: 'Breadth First Search (BFS)', url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/' },
    { title: 'Depth First Search (DFS)', url: 'https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/' },
    { title: 'Dijkstra Algorithm', url: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/' },
    { title: 'Dynamic Programming', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
    { title: 'Greedy Algorithms', url: 'https://www.geeksforgeeks.org/greedy-algorithms/' },
    { title: 'Backtracking', url: 'https://www.geeksforgeeks.org/backtracking-algorithms/' },
    { title: 'Recursion', url: 'https://www.geeksforgeeks.org/recursion/' },
  ];

  // C++ Topics
  const cppTopics = [
    { title: 'C++ Introduction', url: 'https://www.geeksforgeeks.org/introduction-to-c/' },
    { title: 'C++ Data Types', url: 'https://www.geeksforgeeks.org/c-data-types/' },
    { title: 'C++ Variables', url: 'https://www.geeksforgeeks.org/variables-in-c/' },
    { title: 'C++ Operators', url: 'https://www.geeksforgeeks.org/operators-c-c/' },
    { title: 'C++ Control Flow', url: 'https://www.geeksforgeeks.org/decision-making-c-c-else-nested-else/' },
    { title: 'C++ Functions', url: 'https://www.geeksforgeeks.org/functions-in-cpp/' },
    { title: 'C++ Pointers', url: 'https://www.geeksforgeeks.org/pointers-in-c-and-c-set-1-introduction-arithmetic-and-array/' },
    { title: 'C++ Classes and Objects', url: 'https://www.geeksforgeeks.org/c-classes-and-objects/' },
    { title: 'C++ Inheritance', url: 'https://www.geeksforgeeks.org/inheritance-in-c/' },
    { title: 'C++ Polymorphism', url: 'https://www.geeksforgeeks.org/polymorphism-in-c/' },
  ];

  // Python Topics
  const pythonTopics = [
    { title: 'Python Introduction', url: 'https://www.geeksforgeeks.org/python-programming-language/' },
    { title: 'Python Data Types', url: 'https://www.geeksforgeeks.org/python-data-types/' },
    { title: 'Python Variables', url: 'https://www.geeksforgeeks.org/python-variables/' },
    { title: 'Python Operators', url: 'https://www.geeksforgeeks.org/python-operators/' },
    { title: 'Python Control Flow', url: 'https://www.geeksforgeeks.org/python-if-else/' },
    { title: 'Python Functions', url: 'https://www.geeksforgeeks.org/python-functions/' },
    { title: 'Python Lists', url: 'https://www.geeksforgeeks.org/python-list/' },
    { title: 'Python Tuples', url: 'https://www.geeksforgeeks.org/python-tuples/' },
    { title: 'Python Dictionaries', url: 'https://www.geeksforgeeks.org/python-dictionary/' },
    { title: 'Python Classes', url: 'https://www.geeksforgeeks.org/python-classes-and-objects/' },
  ];

  const allTopics = [
    ...dsaTopics.map(t => ({ ...t, category: 'dsa' })),
    ...cppTopics.map(t => ({ ...t, category: 'cpp' })),
    ...pythonTopics.map(t => ({ ...t, category: 'python' }))
  ];

  console.log(`\n📚 Fetching ${allTopics.length} topics from GeeksforGeeks...\n`);

  for (const topic of allTopics) {
    try {
      console.log(`Fetching: ${topic.title}...`);
      
      const articleContent = await fetchArticleContent(topic.url);
      const slug = createSlug(topic.title);
      const description = articleContent.sections[0]?.content.substring(0, 200) || 
                         `Learn ${topic.title} from GeeksforGeeks`;
      const difficulty = determineDifficulty(topic.title, articleContent.sections[0]?.content || '');
      
      // Determine parent slug for hierarchical topics
      let parentSlug: string | undefined;
      if (topic.title.includes('Binary Search Tree')) {
        parentSlug = createSlug('Binary Tree');
      } else if (topic.title.includes('Advanced') || topic.title.includes('Intermediate')) {
        const baseTitle = topic.title.replace(/Advanced|Intermediate/gi, '').trim();
        parentSlug = createSlug(baseTitle);
      }

      const concept: ConceptData = {
        title: topic.title,
        slug,
        description,
        difficulty,
        order: order++,
        parentSlug,
        tags: [topic.category, ...topic.title.toLowerCase().split(' ')],
        article: articleContent,
      };

      concepts.push(concept);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing ${topic.title}:`, error);
    }
  }

  return concepts;
}

// Main function
async function main() {
  console.log('🚀 Starting GeeksforGeeks data fetch...\n');
  
  try {
    const concepts = await fetchGeeksforGeeksTopics();
    
    // Generate TypeScript code
    const code = `// This file is auto-generated from GeeksforGeeks data
// Generated on: ${new Date().toISOString()}

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

export const geeksforGeeksData: ConceptData[] = ${JSON.stringify(concepts, null, 2)};
`;

    // Save to file
    const scriptDir = path.resolve(__dirname);
    const outputPath = path.join(scriptDir, '../prisma/geeksforGeeksData.ts');
    fs.writeFileSync(outputPath, code, 'utf-8');
    
    console.log(`\n✅ Successfully fetched ${concepts.length} topics!`);
    console.log(`📁 Data saved to: ${outputPath}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

