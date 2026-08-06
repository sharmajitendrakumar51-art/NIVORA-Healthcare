import { Router } from 'express';
import { getCustomData } from '../controllers/customController';

const router = Router();

router.get('/', getCustomData);

export default router;
