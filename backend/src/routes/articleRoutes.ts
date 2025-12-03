import { Router } from 'express';
import * as articleController from '../controllers/articleController';

const router = Router();

router.get('/concept/:conceptId', articleController.getArticleByConceptId);

export default router;

