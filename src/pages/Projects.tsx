import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { FolderOpen, Plus, Users, Calendar, BarChart3, Edit, Trash2, Lock } from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, currentUser, createProject } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    key: ''
  });

  // Check if user can create projects (Only Project Leads and Department Heads, NOT admins)
  const canCreateProject = currentUser && currentUser.role && ['project-lead', 'department-head'].includes(currentUser.role);
  
  // Check if user can delete a project
  const canDeleteProject = (projectOwnerId?: string) => {
    if (!currentUser || !currentUser.role) return false;
    // Admin and department-head can delete any project
    if (['admin', 'department-head'].includes(currentUser.role)) return true;
    // Project lead can delete their own projects
    if (currentUser.role === 'project-lead' && currentUser.id === projectOwnerId) return true;
    return false;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim() && currentUser) {
      await createProject({
        name: newProject.name.trim(),
        key: newProject.key.trim() || newProject.name.trim().substring(0, 3).toUpperCase(),
        description: newProject.description.trim() || 'New project',
        ownerId: currentUser.id,
        members: [currentUser]
      });
      setNewProject({ name: '', description: '', key: '' });
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // TODO: Implement delete project API call
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">
          {currentUser?.role === 'admin' 
            ? 'All Projects (Management View)' 
            : currentUser?.role === 'team-member' 
            ? 'My Projects' 
            : 'Projects'}
        </h1>
        <p className="text-[#7C6F64] !important text-lg">
          {currentUser?.role === 'admin'
            ? 'View and manage all projects across the organization'
            : currentUser?.role === 'team-member' 
            ? 'Projects you\'re assigned to' 
            : currentUser?.role === 'department-head'
            ? 'Manage department projects'
            : 'Manage and organize your projects'}
        </p>
      </div>

      {/* Actions */}
      {canCreateProject && (
        <div className="flex justify-center">
          <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      {!canCreateProject && currentUser?.role === 'team-member' && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-[#E0FBFC] rounded-lg border-2 border-[#9B5DE5]/20">
            <Lock className="w-4 h-4 text-[#7C6F64]" />
            <span className="text-sm text-[#7C6F64] !important">
              Only Project Leads and Department Heads can create projects
            </span>
          </div>
        </div>
      )}

      {!canCreateProject && currentUser?.role === 'admin' && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#D7263D]/10 to-[#E07A5F]/10 rounded-lg border-2 border-[#D7263D]/20">
            <Lock className="w-4 h-4 text-[#D7263D]" />
            <span className="text-sm text-[#1E1E24] !important font-medium">
              Admins manage projects but cannot create them. Project creation is done by Project Leads and Department Heads.
            </span>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10 hover-lift">
              {/* Project Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1E1E24] !important">{project.name}</h3>
                    <p className="text-sm text-[#7C6F64] !important">{project.key}</p>
                  </div>
                </div>
                {canDeleteProject(project.ownerId) && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-[#7C6F64] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => project.id && handleDeleteProject(project.id)}
                      className="p-2 text-[#7C6F64] hover:text-[#D7263D] hover:bg-[#D7263D]/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Project Description */}
              <p className="text-sm text-[#7C6F64] !important mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Project Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7C6F64] !important">Team Members</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-[#9B5DE5]" />
                    <span className="font-medium text-[#1E1E24] !important">{project.members?.length || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7C6F64] !important">Status</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F7B801]/20 text-[#F7B801]">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7C6F64] !important">Created</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#E07A5F]" />
                    <span className="text-[#1E1E24] !important">
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Actions */}
              <div className="mt-4 pt-4 border-t border-[#9B5DE5]/20">
                <Button className="w-full btn-secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto text-[#7C6F64] mb-4" />
          <h3 className="text-lg font-medium text-[#1E1E24] !important mb-2">No Projects Yet</h3>
          <p className="text-[#7C6F64] !important mb-4">Get started by creating your first project</p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-[#9B5DE5]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1E1E24] !important">Create New Project</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#7C6F64] hover:text-[#1E1E24] p-2 hover:bg-[#9B5DE5]/10 rounded-2xl transition-all duration-300"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-3">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-3">Project Key</label>
                <input
                  type="text"
                  value={newProject.key}
                  onChange={(e) => setNewProject(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Project key (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-3">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Describe your project (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newProject.name.trim()}
                  className="btn-primary"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

