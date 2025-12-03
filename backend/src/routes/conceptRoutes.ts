import { Router } from 'express';
import * as conceptController from '../controllers/conceptController';

const router = Router();

router.get('/', conceptController.getAllConcepts);
router.get('/:id', conceptController.getConceptById);
router.get('/slug/:slug', conceptController.getConceptBySlug);

export default router;

