import { Router } from 'express';
import * as controller from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../utils/validation';
import {
  createTaskValidator,
  taskIdValidator,
  taskQueryValidators,
  updateTaskValidator,
} from '../validators/taskValidators';

const router = Router();
router.use(requireAuth);

router.get('/', taskQueryValidators, validateRequest, asyncHandler(controller.list));
router.post('/', createTaskValidator, validateRequest, asyncHandler(controller.create));
router.get('/:id', taskIdValidator, validateRequest, asyncHandler(controller.get));
router.put(
  '/:id',
  [...taskIdValidator, ...updateTaskValidator],
  validateRequest,
  asyncHandler(controller.update),
);
router.patch(
  '/:id/complete',
  taskIdValidator,
  validateRequest,
  asyncHandler(controller.toggleComplete),
);
router.delete('/:id', taskIdValidator, validateRequest, asyncHandler(controller.remove));

export default router;
