import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all visualizations
export const getVisualizations = async (req: Request, res: Response) => {
  try {
    const { conceptId } = req.query;
    
    const where = conceptId ? { conceptId: conceptId as string } : {};
    
    const visualizations = await prisma.visualization.findMany({
      where,
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ visualizations });
  } catch (error: any) {
    console.error('Error fetching visualizations:', error);
    res.status(500).json({ error: 'Failed to fetch visualizations' });
  }
};

// Get visualization by ID
export const getVisualizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visualization = await prisma.visualization.findUnique({
      where: { id },
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

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    res.json({ visualization });
  } catch (error: any) {
    console.error('Error fetching visualization:', error);
    res.status(500).json({ error: 'Failed to fetch visualization' });
  }
};

// Get visualizations by concept ID
export const getVisualizationsByConceptId = async (req: Request, res: Response) => {
  try {
    const { conceptId } = req.params;

    const visualizations = await prisma.visualization.findMany({
      where: { conceptId },
      include: {
        concept: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ visualizations });
  } catch (error: any) {
    console.error('Error fetching visualizations by concept:', error);
    res.status(500).json({ error: 'Failed to fetch visualizations' });
  }
};

// Create visualization (admin only - but simplified for now)
export const createVisualization = async (req: Request, res: Response) => {
  try {
    const { conceptId, type, config } = req.body;

    if (!conceptId || !type) {
      return res.status(400).json({ error: 'conceptId and type are required' });
    }

    // Verify concept exists
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    const visualization = await prisma.visualization.create({
      data: {
        conceptId,
        type,
        config: config || {},
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

    res.status(201).json({ visualization });
  } catch (error: any) {
    console.error('Error creating visualization:', error);
    res.status(500).json({ error: 'Failed to create visualization' });
  }
};

// Update visualization
export const updateVisualization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, config } = req.body;

    const visualization = await prisma.visualization.findUnique({
      where: { id },
    });

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    const updated = await prisma.visualization.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(config && { config }),
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

    res.json({ visualization: updated });
  } catch (error: any) {
    console.error('Error updating visualization:', error);
    res.status(500).json({ error: 'Failed to update visualization' });
  }
};

// Delete visualization
export const deleteVisualization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const visualization = await prisma.visualization.findUnique({
      where: { id },
    });

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    await prisma.visualization.delete({
      where: { id },
    });

    res.json({ message: 'Visualization deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting visualization:', error);
    res.status(500).json({ error: 'Failed to delete visualization' });
  }
};

