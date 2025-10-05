import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { tasks, currentProject, createProject, currentUser } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'highest').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && currentUser) {
      createProject({
        name: projectName.trim(),
        key: projectName.trim().substring(0, 3).toUpperCase(),
        description: 'New project',
        ownerId: currentUser.id,
        members: [currentUser]
      });
      setProjectName('');
      setShowCreateProject(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: BarChart3,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: AlertCircle,
      color: 'text-[#D7263D]',
      bgColor: 'bg-gradient-to-br from-[#D7263D]/20 to-[#B91C1C]/20',
      borderColor: 'border-[#D7263D]/30'
    },
    {
      title: 'Completed',
      value: stats.done,
      icon: CheckCircle,
      color: 'text-[#F7B801]',
      bgColor: 'bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20',
      borderColor: 'border-[#F7B801]/30'
    },
    {
      title: 'Team Members',
      value: currentProject?.members?.length || 0,
      icon: Users,
      color: 'text-[#9B5DE5]',
      bgColor: 'bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20',
      borderColor: 'border-[#9B5DE5]/30'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-[#00F5D4]',
      bgColor: 'bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20',
      borderColor: 'border-[#00F5D4]/30'
    }
  ];

  const recentTasks = tasks
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">
          Dashboard
        </h1>
        {currentProject ? (
          <p className="text-[#7C6F64] !important text-lg">
            Project overview for <span className="font-medium text-[#1E1E24] !important">{currentProject.name}</span>
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-[#7C6F64] !important text-lg">Welcome to TaskMaster Pro! Get started by creating your first project.</p>
            <Button onClick={() => setShowCreateProject(true)} className="btn-primary">
              Create Your First Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1E24]/60 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-[#9B5DE5]/20">
            <h3 className="text-2xl font-bold text-[#1E1E24] !important mb-6 text-center">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button type="submit" disabled={!projectName.trim()} className="btn-primary">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className={`card rounded-2xl p-6 hover-lift border-2 ${stat.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7C6F64] !important mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-[#1E1E24] !important">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} border-2 ${stat.borderColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Breakdown */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1E1E24] !important mb-6">Task Status</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', count: stats.todo, color: 'bg-[#7C6F64]' },
              { label: 'In Progress', count: stats.inProgress, color: 'bg-[#9B5DE5]' },
              { label: 'Review', count: stats.review, color: 'bg-[#E07A5F]' },
              { label: 'Done', count: stats.done, color: 'bg-[#F7B801]' }
            ].map(status => (
              <div key={status.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#9B5DE5]/10 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm text-[#1E1E24] !important">{status.label}</span>
                </div>
                <span className="text-sm font-medium text-[#1E1E24] !important">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1E1E24] !important mb-6">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-[#9B5DE5]/10 transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E1E24] !important truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-[#7C6F64] !important capitalize">
                      {task.status.replace('-', ' ')} • {task.priority} priority
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {task.assignee?.avatar ? (
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#9B5DE5]/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9B5DE5]/20">
                  <CheckCircle className="w-8 h-8 text-[#7C6F64]" />
                </div>
                <p className="text-[#7C6F64] !important">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.overdue > 0 && (
        <div className="card rounded-2xl p-6 border-2 border-[#D7263D]/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#D7263D]/20 rounded-full flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-[#D7263D]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1E1E24] !important mb-1">Overdue Tasks</h4>
              <p className="text-[#D7263D]">
                You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} that need attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};