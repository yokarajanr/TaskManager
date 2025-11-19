import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';

// Middleware to verify authentication
export const requireAuth = async (req, res, next) => {
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
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
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

// Role hierarchy levels
const ROLE_HIERARCHY = {
  'team-member': 1,
  'project-lead': 2,
  'department-head': 3,
  'admin': 4
};

// Check if user has minimum required role
export const requireRole = (minRole) => {
  return (req, res, next) => {
    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires ${minRole} role or higher.`
      });
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is project lead or higher
export const requireProjectLead = (req, res, next) => {
  const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
  if (userRoleLevel < ROLE_HIERARCHY['project-lead']) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Project lead privileges required.'
    });
  }
  next();
};

// Check if user is department head or higher
export const requireDepartmentHead = (req, res, next) => {
  const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
  if (userRoleLevel < ROLE_HIERARCHY['department-head']) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Department head privileges required.'
    });
  }
  next();
};

// Check if user has access to a specific project
export const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project || req.query.project;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Admin and Department Head have access to all projects
    if (req.user.role === 'admin' || req.user.role === 'department-head') {
      req.project = project;
      return next();
    }

    // Check if user is project owner
    if (project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      return next();
    }

    // Check if user is a project member
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this project.'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking project access'
    });
  }
};

// Check if user can modify a project
export const canModifyProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Admin CANNOT modify projects - view-only
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins have view-only access to projects. Only Department Heads and Project Leads can modify projects.'
      });
    }

    // Department Head can modify any project
    if (req.user.role === 'department-head') {
      req.project = project;
      return next();
    }

    // Project owner (Project Lead) can modify their project
    if (project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      return next();
    }

    // Project Lead members can modify if they have 'manager' role in the project
    if (req.user.role === 'project-lead') {
      const memberRole = project.members.find(member => 
        member.user.toString() === req.user._id.toString()
      );
      
      if (memberRole && memberRole.role === 'manager') {
        req.project = project;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to modify this project.'
    });
  } catch (error) {
    console.error('Project modification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking project modification permissions'
    });
  }
};

// Get user's accessible projects based on role
export const getUserProjects = async (userId, userRole) => {
  let query = {};

  switch (userRole) {
    case 'admin':
      // Admin sees ALL projects for management purposes only
      // They don't own or create projects
      query = {};
      break;
    
    case 'department-head':
      // Department Head can see all projects they manage
      query = {};
      break;
    
    case 'project-lead':
      // Project Lead sees projects they created or are members of
      query = {
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      };
      break;
    
    case 'team-member':
      // Team Member only sees projects they're assigned to
      query = {
        'members.user': userId
      };
      break;
    
    default:
      // No access to any projects
      query = { _id: null };
  }

  return query;
};

// Get user's accessible tasks based on role
export const getUserTasksQuery = async (userId, userRole) => {
  let projectIds = [];

  switch (userRole) {
    case 'admin':
    case 'department-head':
      // Can see all tasks
      return {};
    
    case 'project-lead':
      // Can see all tasks in projects they own or are members of
      const projectLeadProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');
      projectIds = projectLeadProjects.map(p => p._id);
      break;
    
    case 'team-member':
      // Can only see tasks assigned to them or in their projects
      const teamMemberProjects = await Project.find({
        'members.user': userId
      }).select('_id');
      projectIds = teamMemberProjects.map(p => p._id);
      
      return {
        $or: [
          { assignee: userId },
          { reporter: userId },
          { project: { $in: projectIds } }
        ]
      };
    
    default:
      return { _id: null };
  }

  return { project: { $in: projectIds } };
};

export default {
  requireAuth,
  requireRole,
  requireAdmin,
  requireProjectLead,
  requireDepartmentHead,
  checkProjectAccess,
  canModifyProject,
  getUserProjects,
  getUserTasksQuery
};
