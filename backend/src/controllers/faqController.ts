import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getFAQsByConceptId = async (req: Request, res: Response) => {
  try {
    const { conceptId } = req.params;

    const faqs = await prisma.fAQ.findMany({
      where: { conceptId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      faqs: faqs.map((faq) => ({
        id: faq.id,
        conceptId: faq.conceptId || '',
        question: faq.question,
        answer: faq.answer,
        createdAt: faq.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

export const searchFAQs = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const faqs = await prisma.fAQ.findMany({
      where: {
        OR: [
          { question: { contains: q, mode: 'insensitive' } },
          { answer: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      faqs: faqs.map((faq) => ({
        id: faq.id,
        conceptId: faq.conceptId || '',
        question: faq.question,
        answer: faq.answer,
        createdAt: faq.createdAt.toISOString(),
        concept: faq.concept ? {
          id: faq.concept.id,
          title: faq.concept.title,
          slug: faq.concept.slug,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error searching FAQs:', error);
    res.status(500).json({ error: 'Failed to search FAQs' });
  }
};
