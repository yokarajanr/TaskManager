import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Plus } from 'lucide-react';
import { CreateTaskModal } from '../components/task/CreateTaskModal';
import { TaskDetailModal } from '../components/task/TaskDetailModal';

export const Calendar: React.FC = () => {
  const { tasks, currentUser, currentProject } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Role-based task filtering for calendar
  const getVisibleTasks = () => {
    if (!currentUser) return [];
    
    // Admins, department heads, and project leads see all tasks
    if (currentUser.role === 'admin' || currentUser.role === 'department-head' || currentUser.role === 'project-lead') {
      return tasks;
    }
    
    // Team members see tasks assigned to them
    return tasks.filter(task => task.assigneeId === currentUser.id);
  };

  // Get current month's tasks
  const getCurrentMonthTasks = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return getVisibleTasks().filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
    });
  };

  const currentMonthTasks = getCurrentMonthTasks();

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  const getTasksForDate = (date: Date) => {
    return getVisibleTasks().filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      case 'lowest': return 'bg-blue-400';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Calculate task statistics for the current month
  const taskStats = useMemo(() => {
    const monthTasks = getCurrentMonthTasks();
    const overdue = monthTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const dueThisWeek = monthTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= nextWeek && t.status !== 'done';
    }).length;
    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.status === 'done').length;
    
    return { overdue, dueThisWeek, total, completed };
  }, [currentMonthTasks]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Calendar</h1>
        <p className="text-[#7C6F64] !important text-lg">
          {currentUser?.role === 'team-member' 
            ? 'View your assigned task deadlines' 
            : 'View and manage team task deadlines'}
        </p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card rounded-2xl p-6 bg-gradient-to-br from-[#9B5DE5]/10 to-[#E0FBFC]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important font-medium mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{taskStats.total}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-[#9B5DE5]" />
          </div>
        </div>

        <div className="card rounded-2xl p-6 bg-gradient-to-br from-green-500/10 to-green-100/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{taskStats.completed}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-100/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important font-medium mb-1">Due This Week</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{taskStats.dueThisWeek}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card rounded-2xl p-6 bg-gradient-to-br from-[#D7263D]/10 to-red-100/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7C6F64] !important font-medium mb-1">Overdue</p>
              <p className="text-3xl font-bold text-[#1E1E24] !important">{taskStats.overdue}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D7263D] flex items-center justify-center">
              <span className="text-white text-xl">!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 text-[#7C6F64] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#E07A5F]/20 to-[#D7263D]/20 rounded-xl border-2 border-[#E07A5F]/30">
              <CalendarIcon className="w-6 h-6 text-[#E07A5F]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E1E24] !important">{formatDate(currentDate)}</h2>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 text-[#7C6F64] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center">
              <span className="text-sm font-semibold text-[#7C6F64] !important">{day}</span>
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={index}
                className={`group min-h-[120px] p-2 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isTodayDate 
                    ? 'border-[#9B5DE5] bg-[#9B5DE5]/10' 
                    : isCurrentMonthDay 
                      ? 'border-[#9B5DE5]/20 bg-[#E0FBFC]/50 hover:border-[#9B5DE5]/40' 
                      : 'border-[#7C6F64]/10 bg-[#7C6F64]/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isTodayDate 
                      ? 'text-[#9B5DE5] font-bold' 
                      : isCurrentMonthDay 
                        ? 'text-[#1E1E24] !important' 
                        : 'text-[#7C6F64] !important'
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  {/* Add task button - only for managers and current month days */}
                  {isCurrentMonthDay && 
                   currentUser && 
                   ['admin', 'department-head', 'project-lead'].includes(currentUser.role || '') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(date);
                        setIsCreateModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#9B5DE5] hover:bg-[#9B5DE5]/20 rounded transition-all duration-200"
                      title="Create task on this date"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task.id);
                      }}
                      className={`p-1 rounded text-xs truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        getPriorityColor(task.priority)
                      } text-white font-medium`}
                      title={`${task.title} - ${task.priority} priority`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show first task in the list
                        if (dayTasks.length > 0) {
                          setSelectedTask(dayTasks[0].id);
                        }
                      }}
                      className="text-xs text-[#7C6F64] !important text-center cursor-pointer hover:text-[#9B5DE5]"
                    >
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E24] !important">Upcoming Tasks</h3>
          
          {/* Quick Create Task Button for Managers */}
          {currentUser && 
           ['admin', 'department-head', 'project-lead'].includes(currentUser.role || '') && (
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setIsCreateModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#9B5DE5] to-[#9B5DE5]/80 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {currentMonthTasks
            .filter(task => task.dueDate && new Date(task.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 10)
            .map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task.id)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[#9B5DE5]/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                  <div>
                    <h4 className="text-sm font-medium text-[#1E1E24] !important">{task.title}</h4>
                    <p className="text-xs text-[#7C6F64] !important">
                      Due {new Date(task.dueDate!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.assignee && (
                    <div className="flex items-center space-x-1 text-xs text-[#7C6F64] !important">
                      <User className="w-3 h-3" />
                      <span>{task.assignee.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-xs text-[#7C6F64] !important">
                    <Clock className="w-3 h-3" />
                    <span>{task.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          
          {currentMonthTasks.filter(task => task.dueDate && new Date(task.dueDate) >= new Date()).length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-[#7C6F64] mb-4" />
              <p className="text-[#7C6F64] !important">No upcoming tasks for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedDate(null);
        }}
        defaultDueDate={selectedDate || undefined}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={tasks.find(t => t.id === selectedTask) || null}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

