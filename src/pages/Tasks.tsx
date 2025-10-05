import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TaskCard } from '../components/task/TaskCard';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { CreateTaskModal } from '../components/task/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Task } from '../types';
import { Plus, Filter, Search, List, Grid } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = search === '' || 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Tasks</h1>
        <p className="text-[#7C6F64] !important text-lg">Manage and track all your tasks</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
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

      {/* Create Task Button */}
      <div className="flex justify-center">
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
              task={task}
              onClick={() => setSelectedTask(task)}
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