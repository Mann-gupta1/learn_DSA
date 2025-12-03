import { Router } from 'express';
import * as codeController from '../controllers/codeController';

const router = Router();

router.post('/execute', codeController.executeCode);

export default router;

