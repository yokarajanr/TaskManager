import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { TaskPriority, TaskType } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDueDate?: Date;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, defaultDueDate }) => {
  const { createTask, currentProject, currentUser, fetchTasks } = useApp();
  
  // Format date to YYYY-MM-DD for input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task' as TaskType,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    estimatedHours: '',
    dueDate: defaultDueDate ? formatDateForInput(defaultDueDate) : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !currentUser) return;

    (async () => {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        status: 'todo',
        priority: formData.priority,
        type: formData.type,
        projectId: currentProject.id,
        assigneeId: formData.assigneeId || undefined,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      };

      const result = await createTask(payload);
      if (result.success) {
        // Ensure UI shows fresh data
        try {
          await fetchTasks(currentProject.id);
        } catch (err) {
          // Non-blocking
          console.error('Refresh after create task failed', err);
        }
      } else {
        console.error('Create task failed:', result.message);
        // Optionally show user feedback here
      }
    })();

    setFormData({
      title: '',
      description: '',
      type: 'task' as TaskType,
      priority: 'medium' as TaskPriority,
      assigneeId: '',
      estimatedHours: '',
      dueDate: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Title <span className="text-[#D7263D]">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Description <span className="text-[#D7263D]">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 resize-none"
            placeholder="Describe the task in detail"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            >
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            >
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="highest">Highest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
              Assign to Team Member
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            >
              <option value="">Unassigned</option>
              {(currentProject?.members || [])
                .filter((member: any) => {
                  // Only show team-member and project-lead roles
                  const user = member.user || member;
                  const role = user.role || member.role;
                  return role === 'team-member' || role === 'project-lead';
                })
                .map((member: any) => {
                  // support different shapes: populated user object, member object with user ref, or simple user object
                  const user = member.user || member;
                  const id = user._id || user.id || user;
                  const name = user.name || (user.fullName) || String(id);
                  const role = user.role || member.role || 'team-member';
                  return (
                    <option key={String(id)} value={String(id)}>
                      {name} ({role.replace('-', ' ')})
                    </option>
                  );
              })}
            </select>
            {!currentProject?.members?.filter((m: any) => {
              const role = (m.user?.role || m.role);
              return role === 'team-member' || role === 'project-lead';
            }).length && (
              <p className="text-xs text-gray-500 mt-1">No team members available in this project</p>
            )}
          </div>

          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              min="0"
              value={formData.estimatedHours}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} className="btn-secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.title.trim()} className="btn-primary">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};