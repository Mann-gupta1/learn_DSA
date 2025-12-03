import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const achievementController = {
  getUserAchievements: async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const earnedAchievementIds = userAchievements.map((ua) => ua.achievementId);

    res.json({
      achievements: allAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        xpReward: a.xpReward,
        earned: earnedAchievementIds.includes(a.id),
        earnedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.earnedAt.toISOString() || null,
      })),
      earnedAchievements: earnedAchievementIds,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
  },
};

