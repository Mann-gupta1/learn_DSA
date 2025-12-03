import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progress = await prisma.progress.findMany({
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
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      progress: progress.map((p) => ({
        userId: p.userId,
        conceptId: p.conceptId,
        status: p.status,
        xpEarned: p.xpEarned,
        completedAt: p.completedAt ? p.completedAt.toISOString() : null,
        updatedAt: p.updatedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
        concept: p.concept ? {
          id: p.concept.id,
          title: p.concept.title,
          slug: p.concept.slug,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export const getProgressByConceptId = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conceptId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progress = await prisma.progress.findUnique({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
      include: {
        concept: true,
      },
    });

    if (!progress) {
      return res.json({
        progress: {
          userId,
          conceptId,
          status: 'not_started',
          xpEarned: 0,
          completedAt: null,
        },
      });
    }

    res.json({
      progress: {
        userId: progress.userId,
        conceptId: progress.conceptId,
        status: progress.status,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
        concept: progress.concept ? {
          id: progress.concept.id,
          title: progress.concept.title,
          slug: progress.concept.slug,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conceptId, status, xpEarned } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!conceptId || !status) {
      return res.status(400).json({ error: 'Concept ID and status are required' });
    }

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
      update: {
        status,
        xpEarned: xpEarned || 0,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
      create: {
        userId,
        conceptId,
        status,
        xpEarned: xpEarned || 0,
        completedAt: status === 'completed' ? new Date() : null,
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

    // Update user XP and level if XP earned
    if (xpEarned && xpEarned > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const newXP = user.xp + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;

        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: newXP,
            level: newLevel,
          },
        });
      }
    }

    res.json({ progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};
