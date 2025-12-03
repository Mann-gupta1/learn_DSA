import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getArticleByConceptId = async (req: Request, res: Response) => {
  try {
    const { conceptId } = req.params;

    const article = await prisma.article.findUnique({
      where: { conceptId },
      include: {
        concept: true,
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      article: {
        id: article.id,
        conceptId: article.conceptId,
        markdown: article.markdown,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};
