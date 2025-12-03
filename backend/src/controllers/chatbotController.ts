import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { urlFetcher } from '../services/urlFetcher';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate AI response based on question and context
 */
export const chat = async (req: Request, res: Response) => {
  try {
    const { question, conceptId, url, conversationHistory } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    let context = '';
    let contextSource = '';
    let foundConceptId: string | null = null;
    let effectiveConceptId: string | undefined = conceptId;

    // 0. Search for concepts in the question if no conceptId provided
    if (!effectiveConceptId) {
      try {
        // Extract potential concept names from question
        // Look for patterns like "what is X", "explain X", "tell me about X", "X is", etc.
        const conceptKeywords = extractConceptKeywords(question);
        
        if (conceptKeywords.length > 0) {
          // Search for concepts matching the keywords
          const matchingConcepts = await prisma.concept.findMany({
            where: {
              OR: [
                { title: { contains: conceptKeywords[0], mode: 'insensitive' as const } },
                { slug: { contains: conceptKeywords[0].toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' as const } },
                { description: { contains: conceptKeywords[0], mode: 'insensitive' as const } },
                ...(conceptKeywords.length > 1 ? [
                  { title: { contains: conceptKeywords[1], mode: 'insensitive' as const } },
                  { slug: { contains: conceptKeywords[1].toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' as const } },
                ] : []),
              ],
            },
            include: {
              articles: true,
              faqs: {
                take: 10,
                orderBy: { createdAt: 'desc' },
              },
            },
            take: 3,
          });

          // Find the best matching concept with improved scoring
          if (matchingConcepts.length > 0) {
            const keyword = conceptKeywords[0].toLowerCase();
            
            // Score each concept match
            const scoredMatches = matchingConcepts.map(concept => {
              const titleLower = concept.title.toLowerCase();
              const slugLower = concept.slug.toLowerCase();
              let score = 0;
              
              // Exact title match gets highest score
              if (titleLower === keyword) {
                score = 100;
              }
              // Title starts with keyword
              else if (titleLower.startsWith(keyword + ' ') || titleLower.startsWith(keyword + '-')) {
                score = 80;
              }
              // Exact slug match
              else if (slugLower === keyword || slugLower === keyword.replace(/\s+/g, '-')) {
                score = 90;
              }
              // Title contains keyword as whole word
              else if (new RegExp(`\\b${keyword}\\b`).test(titleLower)) {
                score = 70;
              }
              // Title contains keyword
              else if (titleLower.includes(keyword)) {
                score = 50;
              }
              // Slug contains keyword
              else if (slugLower.includes(keyword)) {
                score = 40;
              }
              // Description contains keyword
              else if (concept.description?.toLowerCase().includes(keyword)) {
                score = 20;
              }
              
              // Penalize if keyword is part of a longer phrase (e.g., "python" in "Object-Oriented Programming in Python")
              if (titleLower.includes(keyword) && !titleLower.startsWith(keyword) && !titleLower.endsWith(keyword)) {
                score -= 10;
              }
              
              return { concept, score };
            });
            
            // Sort by score (highest first) and get the best match
            scoredMatches.sort((a, b) => b.score - a.score);
            const bestMatch = scoredMatches[0].score > 30 ? scoredMatches[0].concept : null;
            
            if (bestMatch) {
              foundConceptId = bestMatch.id;
              effectiveConceptId = bestMatch.id; // Set conceptId for further processing
            }
          }
        }
      } catch (error) {
        console.error('Error searching for concepts:', error);
      }
    }

    // 1. Try to get concept context if conceptId is provided (or found)
    if (effectiveConceptId) {
      try {
        const concept = await prisma.concept.findUnique({
          where: { id: effectiveConceptId },
          include: {
            articles: true,
            faqs: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (concept) {
          contextSource = `Concept: ${concept.title}`;
          context += `\n\nConcept: ${concept.title}\n`;
          if (concept.description) {
            context += `Description: ${concept.description}\n`;
          }
          if (concept.content) {
            context += `Content: ${concept.content.substring(0, 2000)}\n`;
          }

          // Add article content if available
          if (concept.articles && concept.articles.length > 0) {
            const article = concept.articles[0];
            context += `\nArticle Content: ${article.markdown.substring(0, 3000)}\n`;
          }

          // Add relevant FAQs
          if (concept.faqs && concept.faqs.length > 0) {
            context += '\n\nRelevant FAQs:\n';
            concept.faqs.forEach((faq) => {
              context += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching concept context:', error);
      }
    }

    // 2. If no concept context or URL is explicitly provided, fetch from URL
    if (url && typeof url === 'string') {
      try {
        const urlContent = await urlFetcher.fetchUrl(url);
        contextSource = `URL: ${urlContent.url}`;
        context += `\n\nContent from ${urlContent.title}:\n${urlContent.content}\n`;
      } catch (error: any) {
        console.error('Error fetching URL:', error);
        // Continue without URL content
      }
    }

    // 3. If no context yet, try to extract URL from question
    if (!context && !conceptId && !url) {
      const urls = urlFetcher.extractUrls(question);
      if (urls.length > 0) {
        try {
          const urlContent = await urlFetcher.fetchUrl(urls[0]);
          contextSource = `URL: ${urlContent.url}`;
          context += `\n\nContent from ${urlContent.title}:\n${urlContent.content}\n`;
        } catch (error: any) {
          console.error('Error fetching URL from question:', error);
        }
      }
    }

    // 4. Search FAQs for relevant information
    // Only search FAQs if we have a concept or if the question has specific keywords
    try {
      // Extract meaningful keywords from question (exclude common words)
      const questionLower = question.toLowerCase();
      const stopWords = ['what', 'is', 'are', 'the', 'a', 'an', 'how', 'do', 'does', 'can', 'could', 'would', 'should', 'tell', 'me', 'about', 'explain', 'define'];
      const questionKeywords = questionLower
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.includes(w))
        .slice(0, 5); // Limit to 5 most important keywords

      // Only search FAQs if we have meaningful keywords or a concept
      if (questionKeywords.length > 0 || foundConceptId || effectiveConceptId) {
        const faqWhere: any = {};
        
        if (foundConceptId || effectiveConceptId) {
          // Search FAQs for the specific concept first
          faqWhere.conceptId = foundConceptId || effectiveConceptId;
        }
        
        // Build keyword search - require at least one keyword to match
        if (questionKeywords.length > 0) {
          const keywordConditions = [
            ...questionKeywords.map(keyword => ({
              question: { contains: keyword, mode: 'insensitive' as const },
            })),
            ...questionKeywords.map(keyword => ({
              answer: { contains: keyword, mode: 'insensitive' as const },
            })),
          ];

          if (foundConceptId || effectiveConceptId) {
            // Combine concept filter with keyword search
            faqWhere.AND = [
              { conceptId: foundConceptId || effectiveConceptId },
              { OR: keywordConditions },
            ];
          } else {
            // Only search by keywords if no concept found
            faqWhere.OR = keywordConditions;
          }
        }

        const relevantFAQs = await prisma.fAQ.findMany({
          where: faqWhere,
          include: {
            concept: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        });

        // Filter FAQs to ensure they're actually relevant
        const filteredFAQs = relevantFAQs.filter(faq => {
          const faqText = `${faq.question} ${faq.answer}`.toLowerCase();
          // Check if FAQ contains at least one of the question keywords
          return questionKeywords.length === 0 || questionKeywords.some(keyword => faqText.includes(keyword));
        });

        if (filteredFAQs.length > 0) {
          if (!context) context = '\n';
          context += '\n\nRelevant FAQs and Common Questions:\n';
          filteredFAQs.forEach((faq) => {
            context += `Q: ${faq.question}\nA: ${faq.answer}\n`;
            if (faq.concept) {
              context += `(Related to: ${faq.concept.title})\n`;
            }
            context += '\n';
          });
          
          if (!contextSource && filteredFAQs[0].concept) {
            contextSource = `FAQs about: ${filteredFAQs[0].concept.title}`;
          }
        }
      }
    } catch (error) {
      console.error('Error searching FAQs:', error);
    }

    // 5. Generate response using context
    // Only pass context if it's meaningful (has concept info or relevant FAQs)
    const hasMeaningfulContext = context.includes('Concept:') || 
                                 (context.includes('Relevant FAQs') && context.length > 200);
    
    const response = generateResponse(
      question, 
      hasMeaningfulContext ? context : '', 
      conversationHistory, 
      foundConceptId || effectiveConceptId || null
    );

    res.json({
      response,
      contextUsed: contextSource || (hasMeaningfulContext ? 'Database search' : 'General knowledge'),
      hasContext: hasMeaningfulContext,
      conceptId: foundConceptId || effectiveConceptId || null,
    });
  } catch (error: any) {
    console.error('Error in chatbot:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
};

/**
 * Extract concept keywords from a question
 */
function extractConceptKeywords(question: string): string[] {
  const lowerQuestion = question.toLowerCase().trim();
  const keywords: string[] = [];

  // Patterns to extract concept names
  const patterns = [
    /(?:what is|what's|explain|tell me about|describe|define|what are|what do you know about)\s+([a-z][a-z\s]+?)(?:\?|$|\.|,|and|or)/i,
    /^([a-z][a-z\s]+?)\s+(?:is|are|means|refers to)/i,
    /^(?:about|regarding|concerning)\s+([a-z][a-z\s]+?)(?:\?|$|\.)/i,
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match && match[1]) {
      const keyword = match[1].trim();
      // Remove common stop words
      const cleaned = keyword
        .replace(/\b(the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|may|might|can|must)\b/gi, '')
        .trim();
      if (cleaned.length > 2 && cleaned.length < 50) {
        keywords.push(cleaned);
      }
    }
  }

  // If no pattern matched, try to extract the main noun phrase
  if (keywords.length === 0) {
    // Remove question words and get the main content
    const withoutQuestionWords = question
      .replace(/^(what|how|when|where|why|who|which|whose|whom)\s+(is|are|was|were|do|does|did|will|would|should|could|may|might|can|must)\s+/i, '')
      .replace(/\?/g, '')
      .trim();
    
    if (withoutQuestionWords.length > 2 && withoutQuestionWords.length < 50) {
      keywords.push(withoutQuestionWords);
    }
  }

  return keywords;
}

/**
 * Generate a response based on question and context
 * This is a simple rule-based system. In production, you'd use an AI API like OpenAI, Anthropic, etc.
 */
function generateResponse(
  question: string,
  context: string,
  conversationHistory?: ChatMessage[],
  conceptId?: string | null
): string {
  const lowerQuestion = question.toLowerCase();

  // If we have context, use it to provide a more informed answer
  if (context) {
    // Extract concept title if available
    const conceptMatch = context.match(/Concept:\s*([^\n]+)/);
    const conceptTitle = conceptMatch ? conceptMatch[1] : null;

    // Extract relevant information from context
    const contextLower = context.toLowerCase();
    const questionWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    
    // Extract meaningful keywords from question
    const stopWords = ['what', 'is', 'are', 'the', 'a', 'an', 'how', 'do', 'does', 'can', 'could', 'would', 'should', 'tell', 'me', 'about', 'explain', 'define'];
    const meaningfulKeywords = question.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));

    // Build a comprehensive answer
    let answer = '';

    // Start with concept introduction if available
    if (conceptTitle) {
      answer += `**${conceptTitle}**\n\n`;
    }

    // Extract description
    const descMatch = context.match(/Description:\s*([^\n]+(?:\n(?!Content:|Article|Relevant|Concept:)[^\n]+)*)/);
    if (descMatch) {
      answer += descMatch[1].trim() + '\n\n';
    }

    // Extract main content
    const contentMatch = context.match(/Content:\s*([^\n]+(?:\n(?!Article|Relevant|Concept:)[^\n]+)*)/);
    if (contentMatch) {
      const content = contentMatch[1].trim();
      // Limit content length
      if (content.length > 1500) {
        answer += content.substring(0, 1500) + '...\n\n';
      } else {
        answer += content + '\n\n';
      }
    }

    // Extract article content if available
    const articleMatch = context.match(/Article Content:\s*([^\n]+(?:\n(?!Relevant|Concept:)[^\n]+)*)/);
    if (articleMatch) {
      const articleContent = articleMatch[1].trim();
      // Extract key paragraphs
      const paragraphs = articleContent.split(/\n\n+/).filter(p => p.length > 50);
      if (paragraphs.length > 0) {
        answer += '**Additional Information:**\n\n';
        answer += paragraphs.slice(0, 2).join('\n\n') + '\n\n';
      }
    }

    // Add relevant FAQs if available - only if they're actually relevant
    const faqSection = context.match(/Relevant FAQs[:\n]+(.*?)(?=\n\n|$)/s);
    if (faqSection && meaningfulKeywords.length > 0) {
      const faqs = faqSection[1].split(/\n\n+/).filter(f => f.trim().length > 0);
      
      // Filter FAQs to only include those that match the question keywords
      const relevantFAQs = faqs.filter(faq => {
        const faqLower = faq.toLowerCase();
        return meaningfulKeywords.some(keyword => faqLower.includes(keyword));
      });

      if (relevantFAQs.length > 0) {
        answer += '**Common Questions:**\n\n';
        relevantFAQs.slice(0, 3).forEach((faq, index) => {
          const qMatch = faq.match(/Q:\s*(.+?)(?:\n|$)/);
          const aMatch = faq.match(/A:\s*(.+?)(?:\n|$)/);
          if (qMatch && aMatch) {
            answer += `${index + 1}. **${qMatch[1]}**\n   ${aMatch[1]}\n\n`;
          }
        });
      }
    } else if (faqSection && conceptTitle) {
      // If we have a concept but no keywords, show FAQs anyway (they're concept-specific)
      const faqs = faqSection[1].split(/\n\n+/).filter(f => f.trim().length > 0);
      if (faqs.length > 0) {
        answer += '**Common Questions:**\n\n';
        faqs.slice(0, 3).forEach((faq, index) => {
          const qMatch = faq.match(/Q:\s*(.+?)(?:\n|$)/);
          const aMatch = faq.match(/A:\s*(.+?)(?:\n|$)/);
          if (qMatch && aMatch) {
            answer += `${index + 1}. **${qMatch[1]}**\n   ${aMatch[1]}\n\n`;
          }
        });
      }
    }

    // If we have a good answer, return it
    if (answer.trim().length > 100) {
      answer += '\n---\n';
      answer += '*For more detailed information, you can visit the concept page or explore related articles and visualizations.*';
      return answer;
    }

    // Fallback: Find sentences in context that contain question words
    const relevantSentences: string[] = [];
    const sentences = context.split(/[.!?]\s+/);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matches = questionWords.filter((word) => sentenceLower.includes(word));
      if (matches.length > 0 && sentence.length > 20 && sentence.length < 500) {
        relevantSentences.push(sentence.trim());
      }
    }

    if (relevantSentences.length > 0) {
      const extractedAnswer = relevantSentences.slice(0, 5).join(' ') + '.';
      return `${conceptTitle ? `**${conceptTitle}**\n\n` : ''}${extractedAnswer}\n\n${
        context.length > 5000
          ? '\n*Note: This is a summary. For complete information, please visit the concept page.*'
          : ''
      }`;
    }
  }

  // General responses for common questions
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('explain') || lowerQuestion.includes('tell me about') || lowerQuestion.includes('define')) {
    // Try to search for the concept one more time
    const keywords = extractConceptKeywords(question);
    if (keywords.length > 0) {
      return `I'd be happy to explain "${keywords[0]}"! 

However, I couldn't find specific information about it in our database. 

To get the best answer, you can:
1. **Search for the concept** using the search bar at the top
2. **Browse concepts** from the navigation menu
3. **Provide a URL** if you want me to fetch information from a webpage
4. Ask a more specific question about Data Structures and Algorithms

I can help you understand concepts, solve problems, and guide you through the DSA learning platform!`;
    }
    
    return `I'd be happy to explain! However, I don't have specific context about "${question}". 

To provide a better answer, please:
1. Navigate to a concept page to get context-specific answers
2. Provide a URL if you want me to fetch information from a webpage
3. Ask a more specific question about Data Structures and Algorithms

I can help you understand concepts, solve problems, and guide you through the DSA learning platform!`;
  }

  if (lowerQuestion.includes('how to') || lowerQuestion.includes('how do')) {
    return `To help you with "${question}", I need more context. 

You can:
- Navigate to a specific concept page and ask your question there
- Provide a URL with relevant information
- Be more specific about what you're trying to accomplish

I'm here to help you learn Data Structures and Algorithms!`;
  }

  if (lowerQuestion.includes('help') || lowerQuestion.includes('guide')) {
    return `I'm here to help! This DSA Learning Platform offers:

📚 **Learning Features:**
- Browse concepts with hierarchical organization
- Read interactive articles with code examples
- Practice coding problems
- Visualize data structures and algorithms

💻 **Code Features:**
- Execute code in Python, C++, JavaScript, and Go
- Track your code history
- Test solutions to practice problems

🏆 **Gamification:**
- Earn XP and level up
- Unlock achievements
- Compete on the leaderboard
- Track your learning progress

What would you like to know more about?`;
  }

  // Default response
  return `I understand you're asking about "${question}". 

To provide the best answer, I can:
1. Use context from the current concept page you're viewing
2. Fetch information from a URL you provide
3. Search through our FAQ database

For concept-specific questions, navigate to that concept's page. For general questions about the app, I can help with navigation, features, and usage.

Would you like to provide more context or ask a different question?`;
}

