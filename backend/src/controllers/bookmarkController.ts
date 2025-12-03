import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const bookmarkController = {
  getBookmarks: async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
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
    });

    res.json({
      bookmarks: bookmarks.map((b) => ({
        conceptId: b.conceptId,
        conceptTitle: b.concept.title,
        slug: b.concept.slug,
        bookmarkedAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
  },

  addBookmark: async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conceptId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!conceptId) {
      return res.status(400).json({ error: 'Concept ID is required' });
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
      update: {},
      create: {
        userId,
        conceptId,
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
    });

    res.json({
      bookmark: {
        conceptId: bookmark.conceptId,
        conceptTitle: bookmark.concept.title,
        slug: bookmark.concept.slug,
        bookmarkedAt: bookmark.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
  },

  removeBookmark: async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conceptId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId,
        conceptId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
  },
};

