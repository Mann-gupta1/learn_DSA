import { Router } from 'express';
import {
  getVisualizations,
  getVisualizationById,
  getVisualizationsByConceptId,
  createVisualization,
  updateVisualization,
  deleteVisualization,
} from '../controllers/visualizationController';

const router = Router();

// GET /api/visualizations - Get all visualizations (optional query: ?conceptId=xxx)
router.get('/', getVisualizations);

// GET /api/visualizations/concept/:conceptId - Get visualizations by concept ID
router.get('/concept/:conceptId', getVisualizationsByConceptId);

// GET /api/visualizations/:id - Get visualization by ID
router.get('/:id', getVisualizationById);

// POST /api/visualizations - Create visualization
router.post('/', createVisualization);

// PUT /api/visualizations/:id - Update visualization
router.put('/:id', updateVisualization);

// DELETE /api/visualizations/:id - Delete visualization
router.delete('/:id', deleteVisualization);

export default router;

