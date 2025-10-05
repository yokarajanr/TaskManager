import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { tasks, projects, users } = useApp();

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalUsers: users.length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
  };

  const priorityStats = {
    highest: tasks.filter(t => t.priority === 'highest').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
    lowest: tasks.filter(t => t.priority === 'lowest').length
  };

  const statusStats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Analytics</h1>
        <p className="text-[#7C6F64] !important text-lg">Track your project performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important mb-2">Total Tasks</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20 rounded-xl border-2 border-[#9B5DE5]/30">
              <BarChart3 className="w-8 h-8 text-[#9B5DE5]" />
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border-2 border-[#F7B801]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important mb-2">Completed</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{stats.completedTasks}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20 rounded-xl border-2 border-[#F7B801]/30">
              <CheckCircle className="w-8 h-8 text-[#F7B801]" />
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border-2 border-[#00F5D4]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important mb-2">In Progress</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{stats.inProgressTasks}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20 rounded-xl border-2 border-[#00F5D4]/30">
              <Clock className="w-8 h-8 text-[#00F5D4]" />
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border-2 border-[#D7263D]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important mb-2">Overdue</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{stats.overdueTasks}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#D7263D]/20 to-[#B91C1C]/20 rounded-xl border-2 border-[#D7263D]/30">
              <AlertCircle className="w-8 h-8 text-[#D7263D]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1E1E24] !important mb-6">Task Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'todo' ? 'bg-[#7C6F64]' :
                    status === 'in-progress' ? 'bg-[#9B5DE5]' :
                    status === 'review' ? 'bg-[#E07A5F]' :
                    'bg-[#F7B801]'
                  }`} />
                  <span className="text-sm text-[#1E1E24] !important capitalize">
                    {status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-[#7C6F64]/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'todo' ? 'bg-[#7C6F64]' :
                        status === 'in-progress' ? 'bg-[#9B5DE5]' :
                        status === 'review' ? 'bg-[#E07A5F]' :
                        'bg-[#F7B801]'
                      }`}
                      style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1E1E24] !important">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-[#1E1E24] !important mb-6">Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(priorityStats).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'highest' ? 'bg-[#D7263D]' :
                    priority === 'high' ? 'bg-[#E07A5F]' :
                    priority === 'medium' ? 'bg-[#F7B801]' :
                    priority === 'low' ? 'bg-[#00F5D4]' :
                    'bg-[#7C6F64]'
                  }`} />
                  <span className="text-sm text-[#1E1E24] !important capitalize">{priority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-[#7C6F64]/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        priority === 'highest' ? 'bg-[#D7263D]' :
                        priority === 'high' ? 'bg-[#E07A5F]' :
                        priority === 'medium' ? 'bg-[#F7B801]' :
                        priority === 'low' ? 'bg-[#00F5D4]' :
                        'bg-[#7C6F64]'
                      }`}
                      style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1E1E24] !important">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project & User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1E1E24] !important">Projects</h3>
            <div className="p-2 bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20 rounded-xl border-2 border-[#9B5DE5]/30">
              <BarChart3 className="w-5 h-5 text-[#9B5DE5]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7C6F64] !important">Total Projects</span>
              <span className="font-medium text-[#1E1E24] !important">{stats.totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7C6F64] !important">Active Projects</span>
              <span className="font-medium text-[#1E1E24] !important">{stats.activeProjects}</span>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border-2 border-[#00F5D4]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1E1E24] !important">Users</h3>
            <div className="p-2 bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20 rounded-xl border-2 border-[#00F5D4]/30">
              <Users className="w-5 h-5 text-[#00F5D4]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7C6F64] !important">Total Users</span>
              <span className="font-medium text-[#1E1E24] !important">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#7C6F64] !important">Active Users</span>
              <span className="font-medium text-[#1E1E24] !important">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border-2 border-[#F7B801]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1E1E24] !important">Performance</h3>
            <div className="p-2 bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20 rounded-xl border-2 border-[#F7B801]/30">
              <TrendingUp className="w-5 h-5 text-[#F7B801]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#7C6F64] !important">Completion Rate</span>
              <span className="font-medium text-[#1E1E24] !important">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-[#7C6F64]/20 rounded-full h-2">
              <div
                className="bg-[#F7B801] h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

