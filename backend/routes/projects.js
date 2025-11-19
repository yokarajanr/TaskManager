import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { requireAuth, getUserProjects, requireRole, canModifyProject } from '../middleware/permissions.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /api/projects
// @desc    Get all projects for current user (role-based)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    
    // Build query based on user role
    let query = await getUserProjects(req.user._id, req.user.role);
    
    // CRITICAL: Filter by user's organization
    query.organizationId = req.user.organizationId;

    if (search) {
      query.$and = [{
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { key: { $regex: search, $options: 'i' } }
        ]
      }];
    }

    if (status) {
      if (!query.$and) query.$and = [];
      query.$and.push({ status });
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 })
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

// @route   POST /api/projects
// @desc    Create a new project (Department Head only)
// @access  Private (Department Head)
router.post('/', requireAuth, async (req, res) => {
  try {
    // Only Department Heads can create projects
    if (req.user.role !== 'department-head') {
      return res.status(403).json({
        success: false,
        message: 'Only Department Heads can create projects.'
      });
    }

    const { name, key, description, department, startDate, projectLead, memberIds = [], visibility = 'team', tags = [] } = req.body;

    // Validate required fields
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }

    // Check if project key already exists
    const existingProject = await Project.findOne({ key: key.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project key already exists'
      });
    }

    // Build members array - always include the creator as manager
    const projectMembers = [{ user: req.user._id, role: 'manager' }];
    
    // Add project lead if specified
    if (projectLead && projectLead !== req.user._id.toString()) {
      projectMembers.push({ user: projectLead, role: 'manager' });
    }
    
    // Add other team members
    if (memberIds && memberIds.length > 0) {
      memberIds.forEach(memberId => {
        // Avoid duplicates
        if (memberId !== req.user._id.toString() && memberId !== projectLead) {
          projectMembers.push({ user: memberId, role: 'developer' });
        }
      });
    }

    // Create new project
    const project = new Project({
      name,
      key: key.toUpperCase(),
      description,
      department,
      startDate: new Date(startDate),
      owner: req.user._id,
      createdBy: req.user._id,
      projectLead: projectLead || undefined,
      organizationId: req.user.organizationId, // Assign to user's organization
      visibility,
      tags,
      members: projectMembers
    });

    await project.save();

    // Populate owner and members for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId // Only from same organization
    })
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access to this organization.'
      });
    }

    // Admin and Department Head can access all projects in their organization
    const hasFullAccess = req.user.role === 'admin' || req.user.role === 'department-head';
    
    // Check if user has access to this project
    if (!hasFullAccess && !project.isOwner(req.user._id) && !project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners can update projects.'
      });
    }

    const { name, description, department, status, visibility, tags } = req.body;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, department, status, visibility, tags },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (!project.isOwner(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners can delete projects.'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

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

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or manager
    if (!project.isOwner(req.user._id) && 
        !project.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only owners and managers can add members.'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await project.addMember(userId, role);

    // Populate for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member'
    });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or manager
    if (!project.isOwner(req.user._id) && 
        !project.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only owners and managers can remove members.'
      });
    }

    // Prevent removing the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    await project.removeMember(userId);

    // Populate for response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member'
    });
  }
});

export default router;
