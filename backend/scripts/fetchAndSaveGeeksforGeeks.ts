import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// This script fetches data from GeeksforGeeks and saves it directly to comprehensiveSeed.ts

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

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineDifficulty(title: string, content: string): 'beginner' | 'intermediate' | 'advanced' {
  const lower = (title + ' ' + content).toLowerCase();
  if (lower.includes('basic') || lower.includes('introduction') || lower.includes('fundamental')) {
    return 'beginner';
  }
  if (lower.includes('advanced') || lower.includes('complex')) {
    return 'advanced';
  }
  return 'intermediate';
}

async function fetchContent(url: string): Promise<{ sections: Array<{ heading: string; content: string }> }> {
  try {
    console.log(`  Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 20000
    });
    
    const $ = cheerio.load(response.data);
    const sections: Array<{ heading: string; content: string }> = [];
    
    // Find main content
    const article = $('article').first();
    const content = article.length ? article : $('main, .content').first();
    
    let currentHeading = 'Introduction';
    let currentContent = '';
    
    content.find('h1, h2, h3, h4, p, pre, code, ul, ol').each((_, el) => {
      const $el = $(el);
      const tag = el.tagName.toLowerCase();
      const text = $el.text().trim();
      
      if (!text) return;
      
      if (tag.startsWith('h')) {
        if (currentContent.trim()) {
          sections.push({ heading: currentHeading, content: currentContent.trim() });
          currentContent = '';
        }
        currentHeading = text;
      } else if (tag === 'p') {
        currentContent += text + '\n\n';
      } else if (tag === 'pre' || tag === 'code') {
        currentContent += '```\n' + text + '\n```\n\n';
      } else if (tag === 'ul' || tag === 'ol') {
        $el.find('li').each((_, li) => {
          currentContent += '- ' + $(li).text().trim() + '\n';
        });
        currentContent += '\n';
      }
    });
    
    if (currentContent.trim()) {
      sections.push({ heading: currentHeading, content: currentContent.trim() });
    }
    
    if (sections.length === 0) {
      const intro = content.text().substring(0, 300).trim();
      sections.push({ heading: 'Introduction', content: intro || `Learn more: ${url}` });
    }
    
    return { sections };
  } catch (error: any) {
    console.error(`  Error: ${error.message}`);
    return {
      sections: [{ heading: 'Introduction', content: `Content from GeeksforGeeks. Visit ${url} for details.` }]
    };
  }
}

async function main() {
  console.log('🚀 Fetching GeeksforGeeks data...\n');
  
  const topics = [
    // Core DSA
    { title: 'Arrays', url: 'https://www.geeksforgeeks.org/dsa/array-data-structure-guide/', category: 'dsa' },
    { title: 'Linked List', url: 'https://www.geeksforgeeks.org/dsa/linked-list-data-structure/', category: 'dsa' },
    { title: 'Stack', url: 'https://www.geeksforgeeks.org/dsa/stack-data-structure/', category: 'dsa' },
    { title: 'Queue', url: 'https://www.geeksforgeeks.org/dsa/queue-data-structure/', category: 'dsa' },
    { title: 'Binary Tree', url: 'https://www.geeksforgeeks.org/dsa/tree-data-structure/', category: 'dsa' },
    { title: 'Binary Search Tree', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/', category: 'dsa' },
    { title: 'Heap', url: 'https://www.geeksforgeeks.org/dsa/heap-data-structure/', category: 'dsa' },
    { title: 'Graph', url: 'https://www.geeksforgeeks.org/dsa/graph-data-structure-and-algorithms/', category: 'dsa' },
    { title: 'Hashing', url: 'https://www.geeksforgeeks.org/dsa/hashing-data-structure/', category: 'dsa' },
    
    // Sorting
    { title: 'Bubble Sort', url: 'https://www.geeksforgeeks.org/bubble-sort/', category: 'algorithm' },
    { title: 'Selection Sort', url: 'https://www.geeksforgeeks.org/selection-sort/', category: 'algorithm' },
    { title: 'Insertion Sort', url: 'https://www.geeksforgeeks.org/insertion-sort/', category: 'algorithm' },
    { title: 'Merge Sort', url: 'https://www.geeksforgeeks.org/merge-sort/', category: 'algorithm' },
    { title: 'Quick Sort', url: 'https://www.geeksforgeeks.org/quick-sort/', category: 'algorithm' },
    { title: 'Heap Sort', url: 'https://www.geeksforgeeks.org/heap-sort/', category: 'algorithm' },
    
    // Searching
    { title: 'Linear Search', url: 'https://www.geeksforgeeks.org/linear-search/', category: 'algorithm' },
    { title: 'Binary Search', url: 'https://www.geeksforgeeks.org/binary-search/', category: 'algorithm' },
    
    // Algorithms
    { title: 'Recursion', url: 'https://www.geeksforgeeks.org/dsa/recursion-algorithms/', category: 'algorithm' },
    { title: 'Dynamic Programming', url: 'https://www.geeksforgeeks.org/competitive-programming/dynamic-programming/', category: 'algorithm' },
    { title: 'Greedy Algorithms', url: 'https://www.geeksforgeeks.org/dsa/greedy-algorithms/', category: 'algorithm' },
    { title: 'Backtracking', url: 'https://www.geeksforgeeks.org/dsa/backtracking-algorithms/', category: 'algorithm' },
    
    // Graph Algorithms
    { title: 'Breadth First Search', url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/', category: 'algorithm' },
    { title: 'Depth First Search', url: 'https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/', category: 'algorithm' },
    { title: 'Dijkstra Algorithm', url: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/', category: 'algorithm' },
    
    // C++ Basics
    { title: 'C++ Introduction', url: 'https://www.geeksforgeeks.org/introduction-to-c/', category: 'cpp' },
    { title: 'C++ Data Types', url: 'https://www.geeksforgeeks.org/c-data-types/', category: 'cpp' },
    { title: 'C++ Functions', url: 'https://www.geeksforgeeks.org/functions-in-cpp/', category: 'cpp' },
    { title: 'C++ Classes', url: 'https://www.geeksforgeeks.org/c-classes-and-objects/', category: 'cpp' },
    
    // Python Basics
    { title: 'Python Introduction', url: 'https://www.geeksforgeeks.org/python-programming-language/', category: 'python' },
    { title: 'Python Data Types', url: 'https://www.geeksforgeeks.org/python-data-types/', category: 'python' },
    { title: 'Python Functions', url: 'https://www.geeksforgeeks.org/python-functions/', category: 'python' },
    { title: 'Python Lists', url: 'https://www.geeksforgeeks.org/python-list/', category: 'python' },
  ];
  
  const concepts: ConceptData[] = [];
  
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`[${i + 1}/${topics.length}] ${topic.title}`);
    
    const article = await fetchContent(topic.url);
    const slug = createSlug(topic.title);
    const description = article.sections[0]?.content.substring(0, 200) || `Learn ${topic.title}`;
    const difficulty = determineDifficulty(topic.title, article.sections[0]?.content || '');
    
    let parentSlug: string | undefined;
    if (topic.title.includes('Binary Search Tree')) {
      parentSlug = createSlug('Binary Tree');
    }
    
    concepts.push({
      title: topic.title,
      slug,
      description,
      difficulty,
      order: i + 1,
      parentSlug,
      tags: [topic.category, ...topic.title.toLowerCase().split(' ')],
      article
    });
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Read existing comprehensiveSeed.ts
  const seedPath = path.join(__dirname, '../prisma/comprehensiveSeed.ts');
  let seedContent = fs.readFileSync(seedPath, 'utf-8');
  
  // Find the concepts array and replace it
  const startMarker = 'const concepts = [';
  const endMarker = '];';
  
  const startIdx = seedContent.indexOf(startMarker);
  if (startIdx === -1) {
    console.error('Could not find concepts array in seed file');
    return;
  }
  
  const endIdx = seedContent.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.error('Could not find end of concepts array');
    return;
  }
  
  // Generate new concepts array code
  const conceptsCode = concepts.map(c => {
    const sectionsCode = c.article.sections.map(s => 
      `          {
            heading: ${JSON.stringify(s.heading)},
            content: ${JSON.stringify(s.content)}
          }`
    ).join(',\n');
    
    return `    {
      title: ${JSON.stringify(c.title)},
      slug: ${JSON.stringify(c.slug)},
      description: ${JSON.stringify(c.description)},
      difficulty: ${JSON.stringify(c.difficulty)},
      order: ${c.order},
      ${c.parentSlug ? `parentSlug: ${JSON.stringify(c.parentSlug)},\n      ` : ''}article: {
        sections: [
${sectionsCode}
        ]
      },
    }`;
  }).join(',\n');
  
  const newConceptsArray = `const concepts = [\n${conceptsCode}\n  ];`;
  
  // Replace the concepts array
  const newSeedContent = 
    seedContent.substring(0, startIdx) + 
    newConceptsArray + 
    seedContent.substring(endIdx + endMarker.length);
  
  fs.writeFileSync(seedPath, newSeedContent, 'utf-8');
  
  console.log(`\n✅ Successfully fetched ${concepts.length} topics and updated comprehensiveSeed.ts!`);
  } catch (error) {
    console.error('❌ Error in main:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

