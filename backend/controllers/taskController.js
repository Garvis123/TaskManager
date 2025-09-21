const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, deadline, assignedTo, priority } = req.body;

    // Verify assignee exists
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    const task = new Task({
      title,
      description,
      deadline: new Date(deadline),
      assignedTo,
      priority: priority || 'Medium',
      createdBy: req.user.id
    });

    await task.save();
    await task.populate(['createdBy', 'assignedTo']);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error during task creation' });
  }
};

const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    // Role-based filtering
    if (req.user.role === 'Member') {
      filter.assignedTo = req.user.id;
    }

    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Date filters
    if (req.query.deadline) {
      const deadlineFilter = req.query.deadline;
      const now = new Date();
      
      switch (deadlineFilter) {
        case 'overdue':
          filter.deadline = { $lt: now };
          filter.status = { $ne: 'Completed' };
          break;
        case 'today':
          const endOfToday = new Date(now);
          endOfToday.setHours(23, 59, 59, 999);
          filter.deadline = { $lte: endOfToday };
          break;
        case 'week':
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filter.deadline = { $lte: nextWeek };
          break;
      }
    }

    // Assignee filter (Admin only)
    if (req.query.assignedTo && req.user.role === 'Admin') {
      filter.assignedTo = req.query.assignedTo;
    }

    // Sort options
    let sort = {};
    switch (req.query.sortBy) {
      case 'deadline':
        sort.deadline = req.query.order === 'desc' ? -1 : 1;
        break;
      case 'priority':
        sort.priority = req.query.order === 'desc' ? -1 : 1;
        break;
      case 'status':
        sort.status = req.query.order === 'desc' ? -1 : 1;
        break;
      default:
        sort.createdAt = -1;
    }

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'Member' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission checks
    const isAdmin = req.user.role === 'Admin';
    const isAssignee = task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members can only update status
    if (!isAdmin && req.body.assignedTo) {
      return res.status(403).json({ message: 'Members cannot reassign tasks' });
    }

    // Update fields
    const allowedUpdates = isAdmin 
      ? ['title', 'description', 'deadline', 'status', 'priority', 'assignedTo']
      : ['status'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate(['createdBy', 'assignedTo']);

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error during task update' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error during task deletion' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const isAdmin = req.user.role === 'Admin';
    const isAssignee = task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      user: req.user.id,
      text
    });

    await task.save();
    await task.populate('comments.user', 'name email');

    res.json({
      message: 'Comment added successfully',
      comment: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment
};