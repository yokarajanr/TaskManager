import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FolderOpen, 
  Settings, 
  Shield,
  Plus,
  X,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';

export const SidePanel: React.FC = () => {
  const { currentUser, currentProject, createProject } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Admin navigation - different from project-working roles
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'Admin Panel', href: '/admin', icon: Shield, color: 'from-[#D7263D] to-[#B91C1C]' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, color: 'from-[#00F5D4] to-[#00D4B4]', badge: 'View Only' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-[#F7B801] to-[#F59E0B]' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'from-[#9B5DE5] to-[#7C3AED]' },
  ];

  // Project-working roles navigation
  const projectNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'Board', href: '/board', icon: CheckSquare, color: 'from-[#00F5D4] to-[#00D4B4]' },
    { name: 'Tasks', href: '/tasks', icon: Target, color: 'from-[#F7B801] to-[#F59E0B]' },
    { name: 'Team', href: '/team', icon: Users, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, color: 'from-[#00F5D4] to-[#00D4B4]' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-[#F7B801] to-[#F59E0B]' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, color: 'from-[#E07A5F] to-[#D7263D]' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'from-[#9B5DE5] to-[#7C3AED]' },
  ];

  // Filter out Team section for team-member role
  const getFilteredNavigation = () => {
    if (currentUser?.role === 'admin') {
      return adminNavigation;
    }
    if (currentUser?.role === 'team-member') {
      return projectNavigation.filter(item => item.name !== 'Team');
    }
    return projectNavigation;
  };

  const navigation = getFilteredNavigation();

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      createProject({
        name: projectName.trim(),
        key: projectName.trim().substring(0, 3).toUpperCase(),
        description: projectDescription.trim() || 'New project',
        ownerId: currentUser?.id || '1',
        members: currentUser ? [currentUser as any] : []
      });
      setProjectName('');
      setProjectDescription('');
      setShowCreateProject(false);
    }
  };

  // Check if user works with projects (not admin)
  const canWorkWithProjects = currentUser?.role && ['team-member', 'project-lead', 'department-head'].includes(currentUser.role);

  return (
    <>
      <div className="w-80 bg-[#E0FBFC]/90 backdrop-blur-md border-r-2 border-[#9B5DE5]/20 flex flex-col h-full shadow-xl">
        {/* Current Project - Only for non-admin roles */}
        {canWorkWithProjects && currentProject && (
          <div className="p-4 border-b-2 border-[#9B5DE5]/20">
            <h3 className="text-xs font-semibold text-[#7C6F64] !important uppercase tracking-wide mb-2">Current Project</h3>
            <div className="bg-gradient-to-br from-[#9B5DE5]/10 to-[#7C3AED]/10 rounded-xl p-3 border-2 border-[#9B5DE5]/30">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#9B5DE5] to-[#7C3AED] rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-[#1E1E24] !important truncate">{currentProject.name}</span>
              </div>
              <p className="text-xs text-[#7C6F64] !important line-clamp-2">{currentProject.description}</p>
            </div>
          </div>
        )}

        {/* Create Project Button (when no current project) - Department Head only */}
        {canWorkWithProjects && !currentProject && currentUser?.role === 'department-head' && (
          <div className="p-4 border-b-2 border-[#9B5DE5]/20">
            <h3 className="text-xs font-semibold text-[#7C6F64] !important uppercase tracking-wide mb-3">Current Project</h3>
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="w-full btn-primary text-sm py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
            <p className="text-xs text-[#7C6F64] !important mt-2 text-center">
              Department Heads create projects
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <h3 className="text-xs font-semibold text-[#7C6F64] !important uppercase tracking-wide mb-3 px-2">Navigation</h3>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'text-[#1E1E24] hover:bg-[#9B5DE5]/10 hover:text-[#9B5DE5]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-[#9B5DE5]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1E1E24] !important">Create New Project</h3>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-[#7C6F64] hover:text-[#1E1E24] p-2 hover:bg-[#9B5DE5]/10 rounded-2xl transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-3">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-3">Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Describe your project (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateProject(false)}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!projectName.trim()}
                  className="btn-primary"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
