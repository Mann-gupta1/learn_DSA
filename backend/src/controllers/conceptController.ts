import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllConcepts = async (req: Request, res: Response) => {
  try {
    // Fetch all concepts from database
    const concepts = await prisma.concept.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        children: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    // Build hierarchical structure (only top-level with children)
    const topLevel = concepts.filter((c) => !c.parentId);
    const hierarchical = topLevel.map((concept) => ({
      id: concept.id,
      title: concept.title,
      slug: concept.slug,
      difficulty: concept.difficulty || 'beginner',
      tags: [], // Add tags if needed
      description: concept.description || '',
      parentId: concept.parentId || null,
      children: (concept.children || []).map((child) => ({
        id: child.id,
        title: child.title,
        slug: child.slug,
        difficulty: child.difficulty || 'beginner',
        tags: [],
        description: child.description || '',
        parentId: child.parentId || null,
        children: [],
      })),
      createdAt: concept.createdAt.toISOString(),
      updatedAt: concept.updatedAt.toISOString(),
    }));

    res.json({ concepts: hierarchical });
  } catch (error) {
    console.error('Error fetching concepts:', error);
    res.status(500).json({ error: 'Failed to fetch concepts' });
  }
};

export const getConceptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const concept = await prisma.concept.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }],
        },
      },
    });

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    res.json({
      concept: {
        id: concept.id,
        title: concept.title,
        slug: concept.slug,
        difficulty: concept.difficulty || 'beginner',
        tags: [],
        description: concept.description || '',
        parentId: concept.parentId || null,
        children: (concept.children || []).map((child) => ({
          id: child.id,
          title: child.title,
          slug: child.slug,
          difficulty: child.difficulty || 'beginner',
          tags: [],
          description: child.description || '',
          parentId: child.parentId || null,
        })),
        createdAt: concept.createdAt.toISOString(),
        updatedAt: concept.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching concept:', error);
    res.status(500).json({ error: 'Failed to fetch concept' });
  }
};

export const getConceptBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const concept = await prisma.concept.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }],
        },
      },
    });

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    res.json({
      concept: {
        id: concept.id,
        title: concept.title,
        slug: concept.slug,
        difficulty: concept.difficulty || 'beginner',
        tags: [],
        description: concept.description || '',
        parentId: concept.parentId || null,
        children: (concept.children || []).map((child) => ({
          id: child.id,
          title: child.title,
          slug: child.slug,
          difficulty: child.difficulty || 'beginner',
          tags: [],
          description: child.description || '',
          parentId: child.parentId || null,
        })),
        createdAt: concept.createdAt.toISOString(),
        updatedAt: concept.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching concept:', error);
    res.status(500).json({ error: 'Failed to fetch concept' });
  }
};
