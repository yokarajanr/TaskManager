import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TaskCard } from '../components/task/TaskCard';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { CreateTaskModal } from '../components/task/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Task } from '../types';
import { Plus, Search, List, Grid, CheckSquare, Clock, AlertCircle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks, currentUser, currentProject } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Role-based task filtering
  const getVisibleTasks = () => {
    if (!currentUser) return [];
    
    // Admins, Department Heads, and Project Leads see ALL tasks in their projects (for management)
    if (currentUser.role === 'admin' || currentUser.role === 'department-head' || currentUser.role === 'project-lead') {
      return tasks;
    }
    
    // Team members ONLY see tasks assigned to them
    if (currentUser.role === 'team-member') {
      return tasks.filter(task => {
        const assigneeId = (task.assignee as any)?._id || (task.assignee as any)?.id || task.assignee || task.assigneeId;
        return assigneeId === currentUser.id || assigneeId === (currentUser as any)._id;
      });
    }
    
    // Default: return all tasks
    return tasks;
  };

  const filteredTasks = getVisibleTasks().filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = search === '' || 
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Calculate task statistics
  const taskStats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    done: filteredTasks.filter(t => t.status === 'done').length
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">
          {currentUser?.role === 'team-member' ? 'My Tasks' : 'Tasks'}
        </h1>
        <p className="text-[#7C6F64] !important text-lg">
          {currentUser?.role === 'team-member' 
            ? 'Track and manage your assigned tasks'
            : currentProject 
              ? `Managing tasks for ${currentProject.name}`
              : 'Manage and track all tasks'
          }
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-5 border-2 border-[#9B5DE5]/20">
          <div className="flex items-center justify-between mb-3">
            <CheckSquare className="w-8 h-8 text-[#9B5DE5]" />
            <span className="text-2xl font-bold text-[#1E1E24] !important">{taskStats.total}</span>
          </div>
          <p className="text-sm font-bold text-[#1E1E24] !important">Total Tasks</p>
          <p className="text-xs text-[#7C6F64] !important">All tasks</p>
        </div>

        <div className="card rounded-2xl p-5 border-2 border-[#00F5D4]/20">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[#00F5D4]" />
            <span className="text-2xl font-bold text-[#1E1E24] !important">{taskStats.inProgress}</span>
          </div>
          <p className="text-sm font-bold text-[#1E1E24] !important">In Progress</p>
          <p className="text-xs text-[#7C6F64] !important">Active tasks</p>
        </div>

        <div className="card rounded-2xl p-5 border-2 border-[#F7B801]/20">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[#F7B801]" />
            <span className="text-2xl font-bold text-[#1E1E24] !important">{taskStats.todo}</span>
          </div>
          <p className="text-sm font-bold text-[#1E1E24] !important">To Do</p>
          <p className="text-xs text-[#7C6F64] !important">Pending tasks</p>
        </div>

        <div className="card rounded-2xl p-5 border-2 border-[#00D084]/20">
          <div className="flex items-center justify-between mb-3">
            <CheckSquare className="w-8 h-8 text-[#00D084]" />
            <span className="text-2xl font-bold text-[#1E1E24] !important">{taskStats.done}</span>
          </div>
          <p className="text-sm font-bold text-[#1E1E24] !important">Completed</p>
          <p className="text-xs text-[#7C6F64] !important">Finished tasks</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7C6F64] w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Create Task Button - Only for Project Leads and Department Heads */}
          {(currentUser?.role === 'project-lead' || currentUser?.role === 'department-head') && currentProject && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex items-center border-2 border-[#9B5DE5]/30 rounded-2xl bg-[#E0FBFC]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-2xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-[#9B5DE5] text-white'
                  : 'text-[#7C6F64] hover:text-[#1E1E24] hover:bg-[#9B5DE5]/10'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-2xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-[#9B5DE5] text-white'
                  : 'text-[#7C6F64] hover:text-[#1E1E24] hover:bg-[#9B5DE5]/10'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Remove standalone Create Task Button */}
      {/* <div className="flex justify-center">
        <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task as Task}
              onClick={() => setSelectedTask(task as Task)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-[#7C6F64] mb-4">
            <List className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-[#1E1E24] !important mb-2">No tasks found</h3>
          <p className="text-[#7C6F64] !important mb-4">
            {search || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first task'
            }
          </p>
          {(!search && filter === 'all') && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};