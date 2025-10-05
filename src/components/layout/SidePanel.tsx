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
  Target,
  Zap
} from 'lucide-react';

export const SidePanel: React.FC = () => {
  const { currentUser, currentProject, createProject } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'Board', href: '/board', icon: CheckSquare, color: 'from-[#00F5D4] to-[#00D4B4]' },
    { name: 'Tasks', href: '/tasks', icon: Target, color: 'from-[#F7B801] to-[#F59E0B]' },
    { name: 'Team', href: '/team', icon: Users, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, color: 'from-[#00F5D4] to-[#00D4B4]' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-[#F7B801] to-[#F59E0B]' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, color: 'from-[#E07A5F] to-[#D7263D]' },
    ...(currentUser?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: Shield, color: 'from-[#D7263D] to-[#B91C1C]' }] : []),
         { name: 'Settings', href: '/settings', icon: Settings, color: 'from-[#9B5DE5] to-[#7C3AED]' },
  ];

  const quickActions = [
    { name: 'Quick Task', icon: Zap, color: 'from-[#9B5DE5] to-[#7C3AED]' },
    { name: 'New Project', icon: Plus, color: 'from-[#00F5D4] to-[#00D4B4]' },
    { name: 'Team Chat', icon: Users, color: 'from-[#F7B801] to-[#F59E0B]' },
  ];

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

  return (
    <>
      <div className="w-80 bg-[#E0FBFC]/90 backdrop-blur-md border-r-2 border-[#9B5DE5]/20 flex flex-col h-full shadow-xl">
        {/* Quick Actions */}
        <div className="p-6 border-b-2 border-[#9B5DE5]/20">
          <h3 className="text-lg font-bold text-[#1E1E24] !important mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                className="p-3 bg-gradient-to-br from-white to-[#E0FBFC] rounded-2xl border-2 border-[#9B5DE5]/20 hover:border-[#9B5DE5]/40 transition-all duration-300 hover-lift group"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-[#1E1E24] !important block text-center">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Project */}
        {currentProject && (
          <div className="p-6 border-b-2 border-[#9B5DE5]/20">
            <div className="bg-gradient-to-br from-white to-[#E0FBFC] rounded-2xl p-4 border-2 border-[#9B5DE5]/20 hover:border-[#9B5DE5]/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1E1E24] !important">Current Project</h3>
                <button 
                  onClick={() => setShowCreateProject(true)}
                  className="p-2 hover:bg-[#9B5DE5]/10 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#9B5DE5]" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-[#9B5DE5] to-[#7C3AED] rounded-full"></div>
                <span className="text-sm font-semibold text-[#1E1E24] !important truncate">{currentProject.name}</span>
              </div>
              <p className="text-xs text-[#7C6F64] !important mt-2 truncate">{currentProject.description}</p>
            </div>
          </div>
        )}

        {/* Create Project Button (when no current project) */}
        {!currentProject && (
          <div className="p-6 border-b-2 border-[#9B5DE5]/20">
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="w-full btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <h3 className="text-lg font-bold text-[#1E1E24] !important mb-4">Navigation</h3>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-4 rounded-2xl text-sm font-semibold transition-all duration-300 hover-lift ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-[#1E1E24] hover:bg-[#9B5DE5]/10 hover:text-[#9B5DE5]'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span>{item.name}</span>
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
