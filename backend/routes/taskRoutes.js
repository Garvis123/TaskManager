const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Create task (Admin only)
router.post('/', [auth, roleAuth(['Admin'])], [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('deadline').isISO8601().withMessage('Please provide a valid deadline'),
  body('assignedTo').isMongoId().withMessage('Please provide a valid assignee ID'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High')
], createTask);

// Get tasks
router.get('/', auth, getTasks);

// Get single task
router.get('/:id', auth, getTaskById);

// Update task
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('deadline').optional().isISO8601().withMessage('Please provide a valid deadline'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('assignedTo').optional().isMongoId().withMessage('Please provide a valid assignee ID')
], updateTask);

// Delete task (Admin only)
router.delete('/:id', [auth, roleAuth(['Admin'])], deleteTask);

// Add comment
router.post('/:id/comments', auth, [
  body('text').trim().isLength({ min: 1, max: 200 }).withMessage('Comment must be between 1 and 200 characters')
], addComment);

module.exports = router;