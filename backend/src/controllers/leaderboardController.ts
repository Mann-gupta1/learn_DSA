import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { filter } = req.query;

    // Get top users by XP
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
      },
      orderBy: {
        xp: 'desc',
      },
      take: 100,
    });

    // Get achievement counts for each user
    const usersWithBadges = await Promise.all(
      users.map(async (user) => {
        const badgeCount = await prisma.userAchievement.count({
          where: { userId: user.id },
        });

        return {
          rank: 0, // Will be set below
          userId: user.id,
          name: user.name,
          xp: user.xp,
          level: user.level,
          badges: badgeCount,
        };
      })
    );

    // Assign ranks
    const leaderboard = usersWithBadges.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // TODO: Filter by time period (weekly, monthly) when needed
    // For now, return all-time leaderboard

    res.json({
      leaderboard: leaderboard.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        name: entry.name,
        xp: entry.xp,
        level: entry.level,
        badges: entry.badges,
      })),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
