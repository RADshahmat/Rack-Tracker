import { Router } from 'express';
import warningController from '../modules/warnings/warning.controller';

const router = Router();

router.get('/', warningController.getAll.bind(warningController));
router.get('/unresolved', warningController.getUnresolved.bind(warningController));
router.patch('/:id/resolve', warningController.resolve.bind(warningController));

export default router;