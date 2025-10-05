import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  MessageCircle, 
  Trash2,
  Calendar,
  Send
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editData, setEditData] = useState<Partial<Task>>({});
  
  const { updateTask, currentUser, currentProject } = useApp();

  if (!task) return null;

  const handleUpdate = () => {
    updateTask(task.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Simple delete - this would normally call an API
      console.log('Deleting task:', task.id);
      onClose();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // Simple comment addition - this would normally call an API
    console.log('Adding comment:', commentText);
    setCommentText('');
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.IN_REVIEW, label: 'Review' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: TaskPriority.LOWEST, label: 'Lowest' },
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.HIGHEST, label: 'Highest' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="xl">
      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            {isEditing ? (
              <textarea
                value={editData.description ?? task.description}
                onChange={(e) => setEditData((prev: Partial<Task>) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Comments ({task.comments.length})
              </h4>
            </div>

            {/* Add comment */}
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button type="submit" size="sm" disabled={!commentText.trim()}>
                        <Send className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {comment.author.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} size="sm">
                  Save
                </Button>
                <Button onClick={() => {setIsEditing(false); setEditData({});}} variant="secondary" size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-900">Status</label>
            {isEditing ? (
              <select
                value={editData.status ?? task.status}
                onChange={(e) => setEditData((prev: Partial<Task>) => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {statusOptions.find(s => s.value === task.status)?.label || task.status}
                </span>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-gray-900">Priority</label>
            {isEditing ? (
              <select
                value={editData.priority ?? task.priority}
                onChange={(e) => setEditData((prev: Partial<Task>) => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {priorityOptions.find(p => p.value === task.priority)?.label || task.priority}
                </span>
              </div>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-gray-900">Assignee</label>
            {isEditing ? (
              <select
                value={editData.assigneeId ?? task.assigneeId ?? ''}
                onChange={(e) => setEditData((prev: Partial<Task>) => ({ ...prev, assigneeId: e.target.value || undefined }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {currentProject?.members?.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center space-x-2 mt-1">
                {task.assignee ? (
                  <>
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Reporter */}
          <div>
            <label className="text-sm font-medium text-gray-900">Reporter</label>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {task.reporter.name?.charAt(0).toUpperCase() || 'R'}
                </span>
              </div>
              <span className="text-sm text-gray-600">{task.reporter.name}</span>
            </div>
          </div>

          {/* Estimated Hours */}
          {task.estimatedHours && (
            <div>
              <label className="text-sm font-medium text-gray-900">Estimated Hours</label>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.estimatedHours}h</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div>
              <label className="text-sm font-medium text-gray-900">Due Date</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {typeof task.dueDate === 'string' ? new Date(task.dueDate).toLocaleDateString() : task.dueDate?.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};