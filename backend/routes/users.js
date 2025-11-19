import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { requireAuth, requireAdmin } from '../middleware/permissions.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password for comparison
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public info only)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar role createdAt')
      .populate('role', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   GET /api/users/my-teams
// @desc    Get teams/projects for current user
// @access  Private
router.get('/my-teams', async (req, res) => {
  try {
    // Get all projects where user is a member
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Format the response with detailed team information
    const teams = projects.map(project => {
      // Get user's role in this project
      const userMember = project.members.find(m => m.user._id.toString() === req.user._id.toString());
      
      return {
        projectId: project._id,
        projectName: project.name,
        projectKey: project.key,
        projectDescription: project.description,
        projectStatus: project.status,
        userRoleInProject: userMember?.role || 'member',
        joinedAt: userMember?.joinedAt,
        owner: {
          id: project.owner._id,
          name: project.owner.name,
          email: project.owner.email,
          avatar: project.owner.avatar,
          role: project.owner.role
        },
        teamMembers: project.members.map(m => ({
          id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.user.role,
          projectRole: m.role,
          joinedAt: m.joinedAt
        })),
        memberCount: project.members.length,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    });

    res.json({
      success: true,
      data: { 
        teams,
        totalTeams: teams.length,
        userRole: req.user.role
      }
    });

  } catch (error) {
    console.error('My teams fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams'
    });
  }
});

// @route   GET /api/users/team-stats
// @desc    Get team statistics for current user
// @access  Private
router.get('/team-stats', async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    });

    const Task = (await import('../models/Task.js')).default;
    
    let totalTasks = 0;
    let assignedTasks = 0;
    let completedTasks = 0;

    for (const project of projects) {
      const projectTasks = await Task.find({ project: project._id });
      totalTasks += projectTasks.length;
      
      const userTasks = projectTasks.filter(t => 
        t.assignee && t.assignee.toString() === req.user._id.toString()
      );
      assignedTasks += userTasks.length;
      completedTasks += userTasks.filter(t => t.status === 'done').length;
    }

    res.json({
      success: true,
      data: {
        projectCount: projects.length,
        totalTasks,
        assignedTasks,
        completedTasks,
        completionRate: assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Team stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team statistics'
    });
  }
});

export default router;
