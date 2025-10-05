import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '../../types';
import { 
  AlertCircle, 
  Bug, 
  CheckSquare, 
  Circle, 
  Clock,
  MessageCircle,
  User
} from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

const priorityIcons = {
  highest: { icon: AlertCircle, color: 'text-[#D7263D]' },
  high: { icon: AlertCircle, color: 'text-[#E07A5F]' },
  medium: { icon: AlertCircle, color: 'text-[#F7B801]' },
  low: { icon: AlertCircle, color: 'text-[#00F5D4]' },
  lowest: { icon: AlertCircle, color: 'text-[#7C6F64]' },
};

const typeIcons = {
  story: { icon: CheckSquare, color: 'text-[#F7B801]' },
  task: { icon: CheckSquare, color: 'text-[#9B5DE5]' },
  bug: { icon: Bug, color: 'text-[#D7263D]' },
  epic: { icon: Circle, color: 'text-[#00F5D4]' },
  feature: { icon: CheckSquare, color: 'text-[#34D399]' },
  improvement: { icon: CheckSquare, color: 'text-[#6366F1]' },
} as const;

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  const PriorityIcon = priorityIcons[task.priority].icon;
  const TypeIcon = typeIcons[task.type as keyof typeof typeIcons]?.icon || CheckSquare;

  return (
    <div
      className={clsx(
        'card rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover-lift border-2 border-[#9B5DE5]/10',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TypeIcon className={clsx('w-4 h-4', typeIcons[task.type as keyof typeof typeIcons]?.color || 'text-[#9B5DE5]')} />
          <span className="text-xs font-medium text-[#7C6F64] !important uppercase tracking-wide">
            {task.type}
          </span>
        </div>
        <PriorityIcon className={clsx('w-4 h-4', priorityIcons[task.priority].color)} />
      </div>

      {/* Title */}
      <h3 className="font-medium text-[#1E1E24] !important mb-2 line-clamp-2 text-sm">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-[#7C6F64] !important mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-[#7C6F64] !important">
        <div className="flex items-center space-x-3">
          {task.assignee && (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="max-w-20 truncate text-[#1E1E24] !important">{task.assignee.name}</span>
            </div>
          )}
          
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
        
        <span className="text-[#7C6F64] !important">{formatDistanceToNow(task.updatedAt, { addSuffix: true })}</span>
      </div>

      {/* Due date */}
      {task.dueDate && (
        <div className={clsx(
          'mt-3 text-xs px-2 py-1 rounded-lg',
          task.dueDate < new Date() 
            ? 'bg-[#D7263D]/20 text-[#D7263D] border-2 border-[#D7263D]/30' 
            : 'bg-[#E0FBFC]/50 text-[#7C6F64] border-2 border-[#9B5DE5]/20'
        )}>
          Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
        </div>
      )}
    </div>
  );
};