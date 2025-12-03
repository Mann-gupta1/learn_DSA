import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default achievements
  const achievements = [
    {
      name: 'first-code',
      description: 'Execute your first piece of code',
      icon: '🎉',
      category: 'code',
      xpReward: 10,
    },
    {
      name: 'code-master',
      description: 'Run 50 code executions',
      icon: '💻',
      category: 'code',
      xpReward: 50,
    },
    {
      name: 'sorting-expert',
      description: 'Complete 5 sorting visualizations',
      icon: '📊',
      category: 'visualization',
      xpReward: 30,
    },
    {
      name: 'tree-explorer',
      description: 'View tree visualizations',
      icon: '🌳',
      category: 'visualization',
      xpReward: 20,
    },
    {
      name: 'concept-complete',
      description: 'Complete 10 concepts',
      icon: '📚',
      category: 'learning',
      xpReward: 100,
    },
    {
      name: 'level-5',
      description: 'Reach level 5',
      icon: '⭐',
      category: 'milestone',
      xpReward: 75,
    },
    {
      name: 'level-10',
      description: 'Reach level 10',
      icon: '🌟',
      category: 'milestone',
      xpReward: 150,
    },
    {
      name: 'bookmark-collector',
      description: 'Bookmark 10 articles',
      icon: '🔖',
      category: 'learning',
      xpReward: 25,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  console.log('✅ Seeded achievements');

  // Create sample concepts
  const arraysConcept = await prisma.concept.upsert({
    where: { slug: 'arrays' },
    update: {},
    create: {
      title: 'Arrays',
      slug: 'arrays',
      description: 'Learn about arrays, one of the most fundamental data structures',
      difficulty: 'beginner',
      order: 1,
      content: '# Arrays\n\nArrays are collections of elements stored in contiguous memory.',
    },
  });

  const linkedListConcept = await prisma.concept.upsert({
    where: { slug: 'linked-lists' },
    update: {},
    create: {
      title: 'Linked Lists',
      slug: 'linked-lists',
      description: 'Dynamic data structures that can grow and shrink',
      difficulty: 'beginner',
      order: 2,
      parentId: arraysConcept.id,
    },
  });

  const stackConcept = await prisma.concept.upsert({
    where: { slug: 'stacks' },
    update: {},
    create: {
      title: 'Stacks',
      slug: 'stacks',
      description: 'LIFO (Last In First Out) data structure',
      difficulty: 'beginner',
      order: 3,
    },
  });

  console.log('✅ Seeded concepts');

  // Create sample article
  await prisma.article.upsert({
    where: { conceptId: arraysConcept.id },
    update: {},
    create: {
      conceptId: arraysConcept.id,
      markdown: `# Arrays in Python and C++

## Introduction

Arrays are one of the most fundamental data structures in computer science.

## Python Example

\`\`\`python
arr = [1, 2, 3, 4, 5]
print(arr[0])  # Output: 1
\`\`\`

## C++ Example

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    cout << arr[0] << endl;  // Output: 1
    return 0;
}
\`\`\`
`,
    },
  });

  // Create sample FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        conceptId: arraysConcept.id,
        question: 'What is an array?',
        answer: 'An array is a collection of elements stored in contiguous memory locations.',
      },
      {
        conceptId: arraysConcept.id,
        question: 'What is the time complexity of array access?',
        answer: 'Array access is O(1) constant time complexity.',
      },
    ],
    skipDuplicates: true,
  });

  // Create sample practice problems
  await prisma.practiceProblem.createMany({
    data: [
      {
        conceptId: arraysConcept.id,
        title: 'Reverse an Array',
        description: 'Write a function to reverse an array in-place.',
        difficulty: 'easy',
        examples: [
          { input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]' },
          { input: '[5, 10, 15]', output: '[15, 10, 5]' },
        ],
        hints: [
          'Use two pointers',
          'Swap elements from both ends',
          'Continue until pointers meet',
        ],
        solution: `def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
        testCases: [
          { input: '[1, 2, 3, 4]', expectedOutput: '[4, 3, 2, 1]' },
          { input: '[5, 10, 15]', expectedOutput: '[15, 10, 5]' },
        ],
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeded articles, FAQs, and practice problems');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

