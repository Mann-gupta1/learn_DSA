import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmarkController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', bookmarkController.getBookmarks);
router.post('/', bookmarkController.addBookmark);
router.delete('/:conceptId', bookmarkController.removeBookmark);

export default router;

