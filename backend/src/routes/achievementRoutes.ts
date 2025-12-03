import { Router } from 'express';
import { achievementController } from '../controllers/achievementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', achievementController.getUserAchievements);

export default router;

