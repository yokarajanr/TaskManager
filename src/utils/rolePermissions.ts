/**
 * Role Permissions and Descriptions
 * 
 * Role Hierarchy:
 * 1. Admin - System administrator (view-only on projects, manages users and settings)
 * 2. Department Head - Creates projects and assigns project leads
 * 3. Project Lead - Manages project tasks, assigns them to team members
 * 4. Team Member - Works on tasks assigned by project leads
 */

export type UserRole = 'team-member' | 'project-lead' | 'department-head' | 'admin';

export interface RoleInfo {
  value: UserRole;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

export const ROLES: Record<UserRole, RoleInfo> = {
  'admin': {
    value: 'admin',
    label: 'Admin',
    description: 'System administrator with user and settings management',
    permissions: [
      'View all projects (read-only)',
      'Manage all users and roles',
      'Approve user registrations',
      'Create organization codes',
      'Manage system settings',
      'View analytics and reports'
    ],
    color: 'from-[#D7263D] to-[#B91C1C]',
    icon: 'Shield'
  },
  'department-head': {
    value: 'department-head',
    label: 'Department Head',
    description: 'Creates projects and assigns project leads',
    permissions: [
      'Create new projects',
      'Assign project leads',
      'View all department projects',
      'Modify project settings',
      'Manage project members',
      'View department analytics'
    ],
    color: 'from-[#9B5DE5] to-[#7C3AED]',
    icon: 'Briefcase'
  },
  'project-lead': {
    value: 'project-lead',
    label: 'Project Lead',
    description: 'Manages project tasks and assigns to team members',
    permissions: [
      'Create and manage tasks',
      'Assign tasks to team members',
      'Update task status and priority',
      'Manage project timeline',
      'View project analytics',
      'Track team progress'
    ],
    color: 'from-[#00F5D4] to-[#00D4B4]',
    icon: 'Target'
  },
  'team-member': {
    value: 'team-member',
    label: 'Team Member',
    description: 'Works on tasks assigned by project leads',
    permissions: [
      'View assigned tasks',
      'Update task progress',
      'Mark tasks as complete',
      'Add comments to tasks',
      'View project board',
      'Track personal workload'
    ],
    color: 'from-[#F7B801] to-[#F59E0B]',
    icon: 'User'
  }
};

/**
 * Check if a role can create projects
 */
export const canCreateProjects = (role: UserRole): boolean => {
  return role === 'department-head';
};

/**
 * Check if a role can create tasks
 */
export const canCreateTasks = (role: UserRole): boolean => {
  return role === 'project-lead' || role === 'department-head';
};

/**
 * Check if a role can modify projects
 */
export const canModifyProjects = (role: UserRole): boolean => {
  return role === 'department-head' || role === 'project-lead';
};

/**
 * Check if a role can manage users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return role === 'admin';
};

/**
 * Check if a role has view-only access to projects
 */
export const isProjectViewOnly = (role: UserRole): boolean => {
  return role === 'admin';
};

/**
 * Check if a role can assign tasks
 */
export const canAssignTasks = (role: UserRole): boolean => {
  return role === 'project-lead' || role === 'department-head';
};

/**
 * Get role level for comparison (higher number = higher privilege)
 */
export const getRoleLevel = (role: UserRole): number => {
  const levels: Record<UserRole, number> = {
    'team-member': 1,
    'project-lead': 2,
    'department-head': 3,
    'admin': 4
  };
  return levels[role] || 0;
};

/**
 * Check if user can work with projects (non-admin roles)
 */
export const canWorkWithProjects = (role: UserRole): boolean => {
  return ['team-member', 'project-lead', 'department-head'].includes(role);
};

/**
 * Get formatted role display text
 */
export const getRoleDisplay = (role: UserRole): string => {
  return ROLES[role]?.label || role;
};

/**
 * Get role description
 */
export const getRoleDescription = (role: UserRole): string => {
  return ROLES[role]?.description || '';
};

/**
 * Get role permissions
 */
export const getRolePermissions = (role: UserRole): string[] => {
  return ROLES[role]?.permissions || [];
};
