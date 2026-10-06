import { body, param, query } from 'express-validator';
import { priorities } from '../models/Task';

export const taskIdValidator = [
  param('id').isMongoId().withMessage('Invalid task identifier'),
];

const taskFields = () => [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 120 })
    .withMessage('Title must be 120 characters or fewer'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2000 characters or fewer'),
  body('priority')
    .optional()
    .isIn(priorities)
    .withMessage('Priority must be Low, Medium, or High'),
  body('category')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 40 })
    .withMessage('Category must be 40 characters or fewer'),
  body('deadline')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO date'),
];

const allowedTaskFields = new Set([
  'title',
  'description',
  'priority',
  'category',
  'deadline',
]);

const onlyTaskFields = body().custom((value: Record<string, unknown>) => {
  const unexpected = Object.keys(value ?? {}).find((key) => !allowedTaskFields.has(key));
  if (unexpected) {
    throw new Error(`Unsupported task field: ${unexpected}`);
  }
  return true;
});

export const createTaskValidator = [...taskFields(), onlyTaskFields];
export const updateTaskValidator = [
  ...taskFields().map((validator) => validator.optional()),
  onlyTaskFields,
  body().custom((value: Record<string, unknown>) => {
    if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
      throw new Error('At least one field is required');
    }
    return true;
  }),
];

export const taskQueryValidators = [
  query('status')
    .optional()
    .isIn(['all', 'pending', 'completed'])
    .withMessage('Invalid status filter'),
  query('sort')
    .optional()
    .isIn(['smart', 'priority', 'deadline', 'createdAt'])
    .withMessage('Invalid sort order'),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isString().trim().isLength({ max: 40 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
