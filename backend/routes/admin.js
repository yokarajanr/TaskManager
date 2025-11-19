import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Organization from '../models/Organization.js';

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
    
    // Build query - filter by organization
    let query = {
      organizationId: req.user.organizationId // Only show users from admin's organization
    };
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

    // Create new user in admin's organization
    const user = new User({
      name,
      email,
      password,
      role,
      organizationId: req.user.organizationId, // Assign to admin's organization
      isApproved: true, // Auto-approve users created by admin
      approvedBy: req.user._id,
      approvedAt: new Date()
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

// @route   GET /api/admin/users/pending
// @desc    Get all pending (unapproved) users
// @access  Admin only
router.get('/users/pending', requireAdmin, async (req, res) => {
  try {
    // Admin can only see pending users from their organization
    const pendingUsers = await User.find({ 
      isApproved: false,
      organizationId: req.user.organizationId 
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users: pendingUsers,
        count: pendingUsers.length
      }
    });

  } catch (error) {
    console.error('Pending users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users'
    });
  }
});

// @route   POST /api/admin/users/:id/approve
// @desc    Approve a pending user
// @access  Admin only
router.post('/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to admin's organization
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve users from your organization'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    // Approve the user
    user.isApproved = true;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} has been approved successfully`,
      data: { user: user.getPublicProfile() }
    });

  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving user'
    });
  }
});

// @route   POST /api/admin/users/:id/reject
// @desc    Reject a pending user (delete the account)
// @access  Admin only
router.post('/users/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to admin's organization
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject users from your organization'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved user. Use deactivate instead.'
      });
    }

    // Delete the user account
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User registration for ${user.email} has been rejected and removed`,
      reason: reason || 'No reason provided'
    });

  } catch (error) {
    console.error('User rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user'
    });
  }
});

// ==================== ORGANIZATION MANAGEMENT ====================

// @route   GET /api/admin/organizations
// @desc    Get all organizations for this admin
// @access  Admin only
router.get('/organizations', requireAdmin, async (req, res) => {
  try {
    const organizations = await Organization.find({ adminId: req.user._id })
      .sort({ createdAt: -1 });

    // Get member counts for each organization
    const orgsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const memberCount = await User.countDocuments({ 
          organizationId: org.code,
          isApproved: true 
        });
        return {
          ...org.toObject(),
          memberCount
        };
      })
    );

    res.json({
      success: true,
      data: { organizations: orgsWithCounts }
    });

  } catch (error) {
    console.error('Organizations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations'
    });
  }
});

// @route   POST /api/admin/organizations
// @desc    Create a new organization code
// @access  Admin only
router.post('/organizations', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required'
      });
    }

    // Generate unique code
    let code = Organization.generateCode(name);
    let isUnique = false;
    let attempts = 0;

    // Ensure code is unique
    while (!isUnique && attempts < 10) {
      const existing = await Organization.findOne({ code });
      if (!existing) {
        isUnique = true;
      } else {
        code = Organization.generateCode(name);
        attempts++;
      }
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique organization code'
      });
    }

    // Create organization
    const organization = new Organization({
      name: name.trim(),
      description: description?.trim() || '',
      code,
      adminId: req.user._id
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Organization creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization'
    });
  }
});

// @route   PUT /api/admin/organizations/:id
// @desc    Update organization details
// @access  Admin only
router.put('/organizations/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const organization = await Organization.findOne({
      _id: id,
      adminId: req.user._id
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (name) organization.name = name.trim();
    if (description !== undefined) organization.description = description.trim();
    if (isActive !== undefined) organization.isActive = isActive;

    await organization.save();

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Organization update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization'
    });
  }
});

// @route   DELETE /api/admin/organizations/:id
// @desc    Delete organization (soft delete - deactivate)
// @access  Admin only
router.delete('/organizations/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({
      _id: id,
      adminId: req.user._id
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if there are members
    const memberCount = await User.countDocuments({ 
      organizationId: organization.code 
    });

    if (memberCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete organization with ${memberCount} members. Please reassign members first.`
      });
    }

    // Soft delete
    organization.isActive = false;
    await organization.save();

    res.json({
      success: true,
      message: 'Organization deactivated successfully'
    });

  } catch (error) {
    console.error('Organization deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting organization'
    });
  }
});

// @route   GET /api/admin/organizations/:code/pending-users
// @desc    Get pending users for a specific organization
// @access  Admin only
router.get('/organizations/:code/pending-users', requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;

    // Verify organization belongs to this admin
    const organization = await Organization.findOne({
      code: code.toUpperCase(),
      adminId: req.user._id
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const pendingUsers = await User.find({ 
      organizationId: code.toUpperCase(),
      isApproved: false 
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        organization: {
          name: organization.name,
          code: organization.code
        },
        users: pendingUsers,
        count: pendingUsers.length
      }
    });

  } catch (error) {
    console.error('Pending users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users'
    });
  }
});

export default router;
