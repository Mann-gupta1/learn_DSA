import { Router } from 'express';
import * as progressController from '../controllers/progressController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All progress routes require authentication
router.use(authMiddleware);

router.get('/', progressController.getProgress);
router.get('/:conceptId', progressController.getProgressByConceptId);
router.post('/', progressController.updateProgress);
router.put('/:conceptId', progressController.updateProgress);

export default router;

