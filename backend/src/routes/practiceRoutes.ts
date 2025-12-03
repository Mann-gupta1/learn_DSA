import { Router } from 'express';
import * as practiceController from '../controllers/practiceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', practiceController.getProblems);
router.get('/:id', practiceController.getProblemById);
router.post('/:id/submit', authMiddleware, practiceController.submitSolution);

export default router;

