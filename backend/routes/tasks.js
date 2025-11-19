import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { requireAuth, getUserTasksQuery, checkProjectAccess } from '../middleware/permissions.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /api/tasks
// @desc    Get all tasks for current user (role-based)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, project, status, priority, type, assignee } = req.query;
    
    // Build base query based on user role
    let query = await getUserTasksQuery(req.user._id, req.user.role);
    
    // CRITICAL: Filter by user's organization
    query.organizationId = req.user.organizationId;

    // Filter by project if specified
    if (project) {
      query.project = project;
      
      // Check if user has access to this project (must be same organization)
      const projectDoc = await Project.findOne({ 
        _id: project, 
        organizationId: req.user.organizationId 
      });
      const hasFullAccess = req.user.role === 'admin' || req.user.role === 'department-head';
      
      if (!projectDoc || (!hasFullAccess && !projectDoc.isOwner(req.user._id) && !projectDoc.isMember(req.user._id))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have access to this project.'
        });
      }
    }

    // Add other filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (assignee) query.assignee = assignee;

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTasks: total,
          tasksPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task (Project Lead only)
// @access  Private (Project Lead)
router.post('/', async (req, res) => {
  try {
    const { title, description, project, assignee, dueDate, estimatedHours, priority = 'medium', type = 'task', labels = [] } = req.body;

    // Only Project Leads can create tasks
    if (req.user.role !== 'project-lead' && req.user.role !== 'department-head') {
      return res.status(403).json({
        success: false,
        message: 'Only Project Leads can create and assign tasks.'
      });
    }

    // Check if project exists and user has access (must be same organization)
    const projectDoc = await Project.findOne({ 
      _id: project, 
      organizationId: req.user.organizationId 
    });
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not in your organization'
      });
    }

    if (!projectDoc.isOwner(req.user._id) && !projectDoc.isMember(req.user._id) && req.user.role !== 'department-head') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this project.'
      });
    }

    // Check if assignee exists and is a project member
    if (assignee) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found'
        });
      }

      if (!projectDoc.isMember(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a member of the project'
        });
      }
    }

    // Create new task
    const task = new Task({
      title,
      description,
      project,
      organizationId: req.user.organizationId, // Assign to user's organization
      assignee,
      reporter: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours,
      priority,
      type,
      labels
    });

    await task.save();

    // Populate for response
    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Task creation error:', error);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId // Only from same organization
    })
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not in your organization'
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({ 
      _id: task.project, 
      organizationId: req.user.organizationId 
    });
    if (!project || (!project.isOwner(req.user._id) && !project.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this task.'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Task fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    if (!project || (!project.isOwner(req.user._id) && !project.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this task.'
      });
    }

    const { title, description, status, priority, type, assignee, dueDate, estimatedHours, labels } = req.body;
    
    // Check if assignee is valid
    if (assignee && assignee !== task.assignee?.toString()) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found'
        });
      }

      if (!project.isMember(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a member of the project'
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, type, assignee, dueDate, estimatedHours, labels },
      { new: true, runValidators: true }
    )
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });

  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    if (!project || (!project.isOwner(req.user._id) && !project.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this task.'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    if (!project || (!project.isOwner(req.user._id) && !project.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this task.'
      });
    }

    await task.addComment(content, req.user._id);

    // Populate for response
    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    if (!project || (!project.isOwner(req.user._id) && !project.isMember(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this task.'
      });
    }

    await task.updateStatus(status);

    // Populate for response
    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status'
    });
  }
});

export default router;
