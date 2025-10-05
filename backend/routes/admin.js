import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

// Middleware to verify admin access
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    
    // Get task statistics
    const completedTasks = await Task.countDocuments({ status: 'done' });
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });
    
    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name key status createdAt')
      .populate('owner', 'name email');
    
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority type createdAt')
      .populate('assignee', 'name')
      .populate('project', 'name key');

    res.json({
      success: true,
      data: {
        counts: {
          totalUsers,
          adminUsers,
          totalProjects,
          totalTasks,
          completedTasks,
          overdueTasks
        },
        recentActivity: {
          users: recentUsers,
          projects: recentProjects,
          tasks: recentTasks
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Admin only
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          usersPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (admin only)
// @access  Admin only
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'team-member' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Admin only
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Admin only
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from all projects
    await Project.updateMany(
      { 'members.user': id },
      { $pull: { members: { user: id } } }
    );

    // Remove user from all tasks
    await Task.updateMany(
      { $or: [{ assignee: id }, { reporter: id }] },
      { 
        $unset: { assignee: 1 },
        $set: { reporter: req.user._id } // Reassign to admin
      }
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects (admin only)
// @access  Admin only
router.get('/projects', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          projectsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project (admin only)
// @access  Admin only
router.delete('/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all tasks in the project first
    await Task.deleteMany({ project: id });

    // Delete the project
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
});

// @route   GET /api/admin/tasks
// @desc    Get all tasks (admin only)
// @access  Admin only
router.get('/tasks', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', priority = '', type = '' } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('project', 'name key')
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
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

// @route   DELETE /api/admin/tasks/:id
// @desc    Delete task (admin only)
// @access  Admin only
router.delete('/tasks/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

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

export default router;
