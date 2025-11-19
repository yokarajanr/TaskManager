import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  ListTodo,
  PlayCircle,
  Target,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { tasks, currentProject, createProject, currentUser, users, projects } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    key: '',
    department: '',
    startDate: '',
    projectLead: '',
    members: [] as string[]
  });

  // Role-based welcome messages
  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', color: 'from-[#D7263D] to-[#E07A5F]' };
      case 'department-head': return { label: 'Department Head', color: 'from-[#9B5DE5] to-[#7C3AED]' };
      case 'project-lead': return { label: 'Project Lead', color: 'from-[#00F5D4] to-[#00D4AA]' };
      case 'team-member': return { label: 'Team Member', color: 'from-[#F7B801] to-[#FFA62B]' };
      default: return { label: 'User', color: 'from-[#7C6F64] to-[#5A524C]' };
    }
  };

  const roleInfo = getRoleDisplay(currentUser?.role);
  // Only Department Heads can create projects (NOT admins, project-leads, or team-members)
  const canCreateProject = currentUser && currentUser.role === 'department-head';

  // Admin-specific stats
  const adminStats = {
    totalUsers: users.length,
    totalProjects: projects.length,
    totalTasks: tasks.length,
    activeProjects: projects.filter(p => p.status !== 'completed').length,
    teamMembers: users.filter(u => u.role === 'team-member').length,
    projectLeads: users.filter(u => u.role === 'project-lead').length,
    departmentHeads: users.filter(u => u.role === 'department-head').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  // Project-working roles stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'highest').length,
    dueToday: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return dueDate.toDateString() === today.toDateString();
    }).length,
    dueThisWeek: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const productivityRate = stats.inProgress > 0 && stats.total > 0 
    ? Math.round((stats.inProgress / stats.total) * 100) 
    : 0;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim() && newProject.department && newProject.startDate && currentUser) {
      createProject({
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
      setShowCreateProject(false);
    }
  };

  // Admin stat cards - System management focused
  const adminStatCards = [
    {
      title: 'Total Users',
      value: adminStats.totalUsers,
      icon: Users,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30',
      subtitle: 'System users'
    },
    {
      title: 'Active Projects',
      value: adminStats.activeProjects,
      icon: Target,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30',
      subtitle: `${adminStats.totalProjects} total`
    },
    {
      title: 'All Tasks',
      value: adminStats.totalTasks,
      icon: BarChart3,
      color: 'text-[#F7B801]',
      bgColor: 'bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20',
      borderColor: 'border-[#F7B801]/30',
      subtitle: 'Across system'
    },
    {
      title: 'Team Members',
      value: adminStats.teamMembers,
      icon: Users,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30',
      subtitle: 'Workers'
    },
    {
      title: 'Project Leads',
      value: adminStats.projectLeads,
      icon: Target,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30',
      subtitle: 'Managers'
    },
    {
      title: 'Dept Heads',
      value: adminStats.departmentHeads,
      icon: TrendingUp,
      color: 'text-[#E07A5F]',
      bgColor: 'bg-gradient-to-br from-[#E07A5F]/20 to-[#D7263D]/20',
      borderColor: 'border-[#E07A5F]/30',
      subtitle: 'Leadership'
    }
  ];

  // Project-working roles stat cards
  const projectStatCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: BarChart3,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30',
      subtitle: 'All tasks'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: PlayCircle,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30',
      subtitle: `${productivityRate}% active`
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: AlertCircle,
      color: 'text-[#D7263D]',
      bgColor: 'bg-gradient-to-br from-[#D7263D]/20 to-[#B91C1C]/20',
      borderColor: 'border-[#D7263D]/30',
      subtitle: 'Need attention'
    },
    {
      title: 'Completed',
      value: stats.done,
      icon: CheckCircle,
      color: 'text-[#F7B801]',
      bgColor: 'bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20',
      borderColor: 'border-[#F7B801]/30',
      subtitle: `${completionRate}% done`
    },
    {
      title: 'Team Members',
      value: currentProject?.members?.length || 0,
      icon: Users,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30',
      subtitle: 'Active members'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30',
      subtitle: 'Success rate'
    }
  ];

  const statCards = currentUser?.role === 'admin' ? adminStatCards : projectStatCards;

  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-[#D7263D] text-white';
      case 'high': return 'bg-[#E07A5F] text-white';
      case 'medium': return 'bg-[#F7B801] text-white';
      case 'low': return 'bg-[#00F5D4] text-[#1E1E24]';
      case 'lowest': return 'bg-[#7C6F64] text-white';
      default: return 'bg-[#7C6F64] text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-[#7C6F64]';
      case 'in-progress': return 'text-[#9B5DE5]';
      case 'review': return 'text-[#E07A5F]';
      case 'done': return 'text-[#F7B801]';
      default: return 'text-[#7C6F64]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-[#1E1E24] !important">
              Welcome back, {currentUser?.name || 'User'}!
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
          {currentUser?.role === 'admin' ? (
            <p className="text-[#7C6F64] !important text-lg">
              System management dashboard - Monitor users, projects, and overall system health
            </p>
          ) : currentProject ? (
            <p className="text-[#7C6F64] !important">
              Project overview for <span className="font-semibold text-[#9B5DE5]">{currentProject.name}</span>
            </p>
          ) : (
            <p className="text-[#7C6F64] !important text-lg">
              {currentUser?.role === 'team-member' 
                ? 'Track your assigned tasks and team progress.' 
                : currentUser?.role === 'project-lead'
                ? "Manage your projects and guide your team to success."
                : "Oversee department projects and team performance."}
            </p>
          )}
        </div>
        {!currentProject && canCreateProject && (
          <Button onClick={() => setShowCreateProject(true)} className="btn-primary">
            Create Your First Project
          </Button>
        )}
      </div>

      {/* Alerts Section - Only for project-working roles */}
      {currentUser?.role !== 'admin' && stats.overdue > 0 && (
        <div className="card rounded-2xl p-4 border-2 border-[#D7263D]/30 bg-[#D7263D]/5">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#D7263D]/20 rounded-xl flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-[#D7263D]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#1E1E24] !important">
                {stats.overdue} Overdue Task{stats.overdue > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-[#7C6F64] !important">
                These tasks need your immediate attention
              </p>
            </div>
            <Button variant="secondary" className="btn-secondary text-xs">
              View All
            </Button>
          </div>
        </div>
      )}

      {stats.dueToday > 0 && (
        <div className="card rounded-2xl p-4 border-2 border-[#F7B801]/30 bg-[#F7B801]/5">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#F7B801]/20 rounded-xl flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-[#F7B801]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#1E1E24] !important">
                {stats.dueToday} Task{stats.dueToday > 1 ? 's' : ''} Due Today
              </h4>
              <p className="text-xs text-[#7C6F64] !important">
                Complete these tasks before end of day
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm p-4">
          <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-[#9B5DE5]/20">
            <div className="px-8 pt-8 pb-4">
              <h3 className="text-2xl font-bold text-[#1E1E24] !important text-center">Create New Project</h3>
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
                <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button type="submit" disabled={!newProject.name.trim() || !newProject.key.trim() || !newProject.description.trim() || !newProject.department || !newProject.startDate} className="btn-primary">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`card rounded-2xl p-5 hover-lift border-2 ${stat.borderColor} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor} border-2 ${stat.borderColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1E1E24] !important">{stat.value}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E1E24] !important mb-1">{stat.title}</p>
              <p className="text-xs text-[#7C6F64] !important">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin: User Distribution / Project Roles: Task Status */}
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-[#1E1E24] !important">
              {currentUser?.role === 'admin' ? 'User Distribution' : 'Task Status'}
            </h3>
            <ListTodo className="w-5 h-5 text-[#9B5DE5]" />
          </div>
          <div className="space-y-3">
            {currentUser?.role === 'admin' ? (
              // Admin: Show user role distribution
              [
                { label: 'Team Members', count: adminStats.teamMembers, color: 'bg-[#F7B801]', icon: Users },
                { label: 'Project Leads', count: adminStats.projectLeads, color: 'bg-[#00F5D4]', icon: Target },
                { label: 'Dept Heads', count: adminStats.departmentHeads, color: 'bg-[#9B5DE5]', icon: TrendingUp },
                { label: 'Admins', count: adminStats.admins, color: 'bg-[#D7263D]', icon: AlertCircle }
              ].map(role => {
                const percentage = adminStats.totalUsers > 0 ? Math.round((role.count / adminStats.totalUsers) * 100) : 0;
                return (
                  <div key={role.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${role.color}`} />
                        <span className="text-sm text-[#1E1E24] !important font-medium">{role.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#7C6F64] !important">{percentage}%</span>
                        <span className="text-sm font-semibold text-[#1E1E24] !important">{role.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#E0FBFC] rounded-full h-2">
                      <div
                        className={`${role.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              // Project roles: Show task status
              [
                { label: 'To Do', count: stats.todo, color: 'bg-[#7C6F64]', icon: ListTodo },
                { label: 'In Progress', count: stats.inProgress, color: 'bg-[#9B5DE5]', icon: PlayCircle },
                { label: 'Review', count: stats.review, color: 'bg-[#E07A5F]', icon: Target },
                { label: 'Done', count: stats.done, color: 'bg-[#F7B801]', icon: CheckCircle }
              ].map(status => {
                const percentage = stats.total > 0 ? Math.round((status.count / stats.total) * 100) : 0;
                return (
                  <div key={status.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <span className="text-sm text-[#1E1E24] !important font-medium">{status.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#7C6F64] !important">{percentage}%</span>
                        <span className="text-sm font-semibold text-[#1E1E24] !important">{status.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#E0FBFC] rounded-full h-2">
                      <div
                        className={`${status.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity - Admin: Projects / Others: Tasks */}
        <div className="card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1E1E24] !important">
              {currentUser?.role === 'admin' ? 'Recent Projects' : 'Recent Tasks'}
            </h3>
            <Clock className="w-5 h-5 text-[#9B5DE5]" />
          </div>
          <div className="space-y-2">
            {currentUser?.role === 'admin' ? (
              // Admin: Show recent projects
              projects.slice(0, 5).length > 0 ? (
                projects.slice(0, 5).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#9B5DE5]/5 transition-all duration-200 border border-transparent hover:border-[#9B5DE5]/20">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1E1E24] !important truncate">
                          {project.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#9B5DE5]/20 text-[#9B5DE5] font-medium">
                            {project.key}
                          </span>
                          <span className="text-xs text-[#7C6F64] !important">
                            {project.members?.length || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#7C6F64] !important py-8">No projects yet</p>
              )
            ) : recentTasks.length > 0 ? (
              // Project roles: Show recent tasks
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#9B5DE5]/5 transition-all duration-200 border border-transparent hover:border-[#9B5DE5]/20">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === 'todo' ? 'bg-[#7C6F64]' :
                      task.status === 'in-progress' ? 'bg-[#9B5DE5]' :
                      task.status === 'review' ? 'bg-[#E07A5F]' :
                      'bg-[#F7B801]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E1E24] !important truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-[#7C6F64] !important">
                          {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {task.assignee ? (
                      <div className="relative group">
                        <div 
                          className="w-8 h-8 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm"
                        >
                          {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1E1E24] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {task.assignee.name}
                        </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-[#E0FBFC] rounded-full flex items-center justify-center border-2 border-[#9B5DE5]/20">
                        <Users className="w-4 h-4 text-[#7C6F64]" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-[#9B5DE5]/20">
                  <CheckCircle className="w-8 h-8 text-[#7C6F64]" />
                </div>
                <p className="text-[#7C6F64] !important text-sm">No tasks yet</p>
                <p className="text-[#7C6F64] !important text-xs mt-1">Create your first task to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin: System Overview / Others: Upcoming Deadlines */}
      {currentUser?.role === 'admin' ? (
        // Admin: System Activity Summary
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#9B5DE5]" />
              <h3 className="text-lg font-semibold text-[#1E1E24] !important">System Overview</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-[#9B5DE5]/10 to-[#7C3AED]/10 rounded-xl border-2 border-[#9B5DE5]/20">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-[#9B5DE5]" />
                <p className="text-sm font-semibold text-[#1E1E24] !important">Users</p>
              </div>
              <p className="text-2xl font-bold text-[#1E1E24] !important">{adminStats.totalUsers}</p>
              <p className="text-xs text-[#7C6F64] !important mt-1">Total in system</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#00F5D4]/10 to-[#00D4B4]/10 rounded-xl border-2 border-[#00F5D4]/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-[#00F5D4]" />
                <p className="text-sm font-semibold text-[#1E1E24] !important">Projects</p>
              </div>
              <p className="text-2xl font-bold text-[#1E1E24] !important">{adminStats.totalProjects}</p>
              <p className="text-xs text-[#7C6F64] !important mt-1">{adminStats.activeProjects} active</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#F7B801]/10 to-[#F59E0B]/10 rounded-xl border-2 border-[#F7B801]/20">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-[#F7B801]" />
                <p className="text-sm font-semibold text-[#1E1E24] !important">Tasks</p>
              </div>
              <p className="text-2xl font-bold text-[#1E1E24] !important">{adminStats.totalTasks}</p>
              <p className="text-xs text-[#7C6F64] !important mt-1">System-wide</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#E07A5F]/10 to-[#D7263D]/10 rounded-xl border-2 border-[#E07A5F]/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#E07A5F]" />
                <p className="text-sm font-semibold text-[#1E1E24] !important">Leads</p>
              </div>
              <p className="text-2xl font-bold text-[#1E1E24] !important">{adminStats.projectLeads}</p>
              <p className="text-xs text-[#7C6F64] !important mt-1">Project managers</p>
            </div>
          </div>
        </div>
      ) : (
        // Project roles: Upcoming Deadlines
        upcomingTasks.length > 0 && (
          <div className="card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#9B5DE5]" />
                <h3 className="text-lg font-semibold text-[#1E1E24] !important">Upcoming Deadlines</h3>
              </div>
              <span className="text-xs text-[#7C6F64] !important">Next {upcomingTasks.length} tasks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {upcomingTasks.map(task => {
                const dueDate = new Date(task.dueDate!);
                const isOverdue = dueDate < new Date();
                const isDueToday = dueDate.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-xl border-2 transition-all duration-200 hover-lift ${
                      isOverdue ? 'bg-[#D7263D]/5 border-[#D7263D]/30' :
                      isDueToday ? 'bg-[#F7B801]/5 border-[#F7B801]/30' :
                      'bg-white border-[#9B5DE5]/10 hover:border-[#9B5DE5]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <div className="relative group">
                          <div 
                            className="w-6 h-6 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm"
                          >
                            {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1E1E24] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {task.assignee.name}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#1E1E24] !important line-clamp-2 mb-2">
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-1 text-xs">
                      <Calendar className={`w-3 h-3 ${
                        isOverdue ? 'text-[#D7263D]' :
                        isDueToday ? 'text-[#F7B801]' :
                        'text-[#7C6F64]'
                      }`} />
                      <span className={`${
                        isOverdue ? 'text-[#D7263D] font-semibold' :
                        isDueToday ? 'text-[#F7B801] font-semibold' :
                        'text-[#7C6F64]'
                      }`}>
                        {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : formatDistanceToNow(dueDate, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};