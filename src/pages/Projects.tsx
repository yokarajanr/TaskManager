import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { FolderOpen, Plus, Users, Calendar, BarChart3, Edit, Trash2, Lock } from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, currentUser, createProject, updateProject, deleteProject, users, setCurrentProject } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    key: '',
    department: '',
    startDate: '',
    projectLead: '',
    members: [] as string[]
  });

  // Check if user can create projects (Only Department Heads, NOT admins, project-leads, or team-members)
  const canCreateProject = currentUser && currentUser.role === 'department-head';
  
  // Only department heads who own the project can edit/delete it
  const canManageProject = (project: any) => {
    if (!currentUser || !project) return false;
    // Check if current user is department head and is the creator
    return currentUser.role === 'department-head' && 
           (currentUser.id === project.createdBy || currentUser.id === project.ownerId || 
            currentUser._id === project.createdBy || currentUser._id === project.ownerId);
  };

  const handleViewProject = (project: any) => {
    setViewingProject(project);
    setIsViewModalOpen(true);
    // Also set as current project for navigation
    setCurrentProject(project);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim() && newProject.department && newProject.startDate && currentUser) {
      await createProject({
        name: newProject.name.trim(),
        key: newProject.key.trim() || newProject.name.trim().substring(0, 3).toUpperCase(),
        description: newProject.description.trim() || 'New project',
        department: newProject.department,
        startDate: newProject.startDate,
        projectLead: newProject.projectLead || undefined,
        memberIds: newProject.members,
        ownerId: currentUser.id,
        members: [currentUser]
      });
      setNewProject({ name: '', description: '', key: '', department: '', startDate: '', projectLead: '', members: [] });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && newProject.name.trim()) {
      const result = await updateProject(editingProject.id, {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        department: newProject.department,
      });
      if (result.success) {
        setNewProject({ name: '', description: '', key: '', department: '', startDate: '', projectLead: '', members: [] });
        setIsEditModalOpen(false);
        setEditingProject(null);
      } else {
        alert(result.message || 'Failed to update project');
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const result = await deleteProject(projectId);
      if (result.success) {
        alert('Project deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete project');
      }
    }
  };

  const openEditModal = (project: any) => {
    setEditingProject(project);
    setNewProject({
      name: project.name || '',
      description: project.description || '',
      key: project.key || '',
      department: project.department || '',
      startDate: project.startDate || '',
      projectLead: project.projectLead || '',
      members: []
    });
    setIsEditModalOpen(true);
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

      {!canCreateProject && (currentUser?.role === 'team-member' || currentUser?.role === 'project-lead') && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-[#E0FBFC] rounded-lg border-2 border-[#9B5DE5]/20">
            <Lock className="w-4 h-4 text-[#7C6F64]" />
            <span className="text-sm text-[#7C6F64] !important">
              Only Department Heads can create projects
            </span>
          </div>
        </div>
      )}

      {!canCreateProject && currentUser?.role === 'admin' && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#D7263D]/10 to-[#E07A5F]/10 rounded-lg border-2 border-[#D7263D]/20">
            <Lock className="w-4 h-4 text-[#D7263D]" />
            <span className="text-sm text-[#1E1E24] !important font-medium">
              Admins manage projects but cannot create them. Project creation is done by Department Heads.
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
                {canManageProject(project) && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(project);
                      }}
                      className="p-2 text-[#7C6F64] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        project.id && handleDeleteProject(project.id);
                      }}
                      className="p-2 text-[#7C6F64] hover:text-[#D7263D] hover:bg-[#D7263D]/10 rounded-lg transition-colors"
                      title="Delete Project"
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
                <Button 
                  onClick={() => handleViewProject(project)}
                  className="w-full btn-secondary"
                >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-[#9B5DE5]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1E1E24] !important">Create New Project</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#7C6F64] hover:text-[#1E1E24] p-2 hover:bg-[#9B5DE5]/10 rounded-2xl transition-all duration-300"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-8 pb-4 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Project Name <span className="text-[#D7263D]">*</span>
                </label>
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
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Project Key <span className="text-[#D7263D]">*</span>
                </label>
                <input
                  type="text"
                  value={newProject.key}
                  onChange={(e) => setNewProject(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 uppercase"
                  placeholder="e.g., PROJ01"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-[#7C6F64] !important mt-1">Unique short identifier</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Description <span className="text-[#D7263D]">*</span>
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 resize-none"
                  placeholder="Summary of project goals and scope"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Department <span className="text-[#D7263D]">*</span>
                </label>
                <select
                  value={newProject.department}
                  onChange={(e) => setNewProject(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  required
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="IT">IT</option>
                </select>
                <p className="text-xs text-[#7C6F64] !important mt-1">Select the department that owns this project</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Start Date <span className="text-[#D7263D]">*</span>
                </label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Project Lead
                </label>
                <select
                  value={newProject.projectLead}
                  onChange={(e) => setNewProject(prev => ({ ...prev, projectLead: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                >
                  <option value="">Select project lead (optional)</option>
                  {(users || [])
                    .filter((u: any) => u.role === 'project-lead' && u.organizationId === currentUser?.organizationId && u.isApproved)
                    .map((user: any) => (
                      <option key={user.id || user._id} value={user.id || user._id}>{user.name}</option>
                    ))}
                </select>
                <p className="text-xs text-[#7C6F64] !important mt-1">Assign a project lead to manage this project</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Team Members
                </label>
                <select
                  multiple
                  value={newProject.members}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProject(prev => ({ ...prev, members: selected }));
                  }}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 min-h-[120px]"
                >
                  {(users || [])
                    .filter((u: any) => u.role === 'team-member' && u.organizationId === currentUser?.organizationId && u.isApproved)
                    .map((user: any) => (
                      <option key={user.id || user._id} value={user.id || user._id}>{user.name}</option>
                    ))}
                </select>
                <p className="text-xs text-[#7C6F64] !important mt-1">Hold Ctrl/Cmd to select multiple members</p>
              </div>
              </div>

              <div className="flex justify-end space-x-3 px-8 py-4 border-t-2 border-[#9B5DE5]/20 bg-white/50 backdrop-blur-sm mt-auto">
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
                  disabled={!newProject.name.trim() || !newProject.key.trim() || !newProject.description.trim() || !newProject.department || !newProject.startDate}
                  className="btn-primary"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-[#9B5DE5]/20">
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#1E1E24] !important">Edit Project</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                    setNewProject({ name: '', description: '', key: '', department: '', startDate: '', projectLead: '', members: [] });
                  }}
                  className="text-[#7C6F64] hover:text-[#1E1E24] p-2 hover:bg-[#9B5DE5]/10 rounded-2xl transition-all duration-300"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-8 pb-4 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Project Name <span className="text-[#D7263D]">*</span>
                </label>
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
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Description <span className="text-[#D7263D]">*</span>
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 resize-none"
                  placeholder="Summary of project goals and scope"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
                  Department <span className="text-[#D7263D]">*</span>
                </label>
                <select
                  value={newProject.department}
                  onChange={(e) => setNewProject(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  required
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              </div>

              <div className="flex justify-end space-x-3 px-8 py-4 border-t-2 border-[#9B5DE5]/20 bg-white/50 backdrop-blur-sm mt-auto">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                    setNewProject({ name: '', description: '', key: '', department: '', startDate: '', projectLead: '', members: [] });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newProject.name.trim() || !newProject.description.trim() || !newProject.department}
                  className="btn-primary"
                >
                  Update Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Project Details Modal */}
      {isViewModalOpen && viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col border-2 border-[#9B5DE5]/20">
            <div className="px-8 pt-8 pb-4 border-b-2 border-[#9B5DE5]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1E1E24] !important">{viewingProject.name}</h3>
                    <p className="text-sm text-[#7C6F64] !important">{viewingProject.key}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingProject(null);
                  }}
                  className="text-[#7C6F64] hover:text-[#1E1E24] p-2 hover:bg-[#9B5DE5]/10 rounded-2xl transition-all duration-300"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 space-y-6">
              {/* Description Section */}
              <div>
                <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-2">Description</h4>
                <p className="text-[#1E1E24] !important">{viewingProject.description || 'No description provided'}</p>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-2">Department</h4>
                  <p className="text-[#1E1E24] !important">{viewingProject.department || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-2">Start Date</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#E07A5F]" />
                    <p className="text-[#1E1E24] !important">
                      {viewingProject.startDate ? new Date(viewingProject.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-2">Created</h4>
                  <p className="text-[#1E1E24] !important">
                    {viewingProject.createdAt ? new Date(viewingProject.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-2">Status</h4>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F7B801]/20 text-[#F7B801]">
                    Active
                  </span>
                </div>
              </div>

              {/* Team Members Section */}
              <div>
                <h4 className="text-sm font-bold text-[#7C6F64] !important uppercase mb-3">Team Members</h4>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#00F5D4]" />
                  <span className="font-medium text-[#1E1E24] !important">
                    {viewingProject.members?.length || 0} {viewingProject.members?.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
                {viewingProject.members && viewingProject.members.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {viewingProject.members.map((member: any, idx: number) => {
                      // Handle both formats: direct user object or nested user object
                      const user = member.user || member;
                      const userName = user.name || user.email || 'Unknown';
                      const userRole = member.role || user.role || '';
                      
                      return (
                        <div key={idx} className="flex items-center space-x-3 p-2 bg-[#E0FBFC] rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#00F5D4] to-[#00D4B4] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1E1E24] !important">{userName}</p>
                            <p className="text-xs text-[#7C6F64] !important capitalize">{userRole}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {canManageProject(viewingProject) && (
                <div className="flex space-x-3 pt-4 border-t-2 border-[#9B5DE5]/20">
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(viewingProject);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      viewingProject.id && handleDeleteProject(viewingProject.id);
                    }}
                    variant="secondary"
                    className="flex-1 bg-[#D7263D]/10 text-[#D7263D] hover:bg-[#D7263D]/20 border-[#D7263D]/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end px-8 py-4 border-t-2 border-[#9B5DE5]/20 bg-white/50 backdrop-blur-sm">
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingProject(null);
                }}
                className="btn-primary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

