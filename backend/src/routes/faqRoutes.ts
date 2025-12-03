import { Router } from 'express';
import * as faqController from '../controllers/faqController';

const router = Router();

router.get('/concept/:conceptId', faqController.getFAQsByConceptId);
router.get('/search', faqController.searchFAQs);

export default router;

