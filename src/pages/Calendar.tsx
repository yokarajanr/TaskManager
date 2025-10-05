import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

export const Calendar: React.FC = () => {
  const { tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month's tasks
  const getCurrentMonthTasks = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return tasks.filter(task => {
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
    return currentMonthTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-[#D7263D]';
      case 'high': return 'bg-[#E07A5F]';
      case 'medium': return 'bg-[#F7B801]';
      case 'low': return 'bg-[#00F5D4]';
      default: return 'bg-[#7C6F64]';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Calendar</h1>
        <p className="text-[#7C6F64] !important text-lg">View and manage your task deadlines</p>
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
                className={`min-h-[120px] p-2 border-2 rounded-xl transition-all duration-300 ${
                  isTodayDate 
                    ? 'border-[#9B5DE5] bg-[#9B5DE5]/10' 
                    : isCurrentMonthDay 
                      ? 'border-[#9B5DE5]/20 bg-[#E0FBFC]/50' 
                      : 'border-[#7C6F64]/10 bg-[#7C6F64]/5'
                }`}
              >
                <div className="text-right mb-2">
                  <span className={`text-sm font-medium ${
                    isTodayDate 
                      ? 'text-[#9B5DE5] font-bold' 
                      : isCurrentMonthDay 
                        ? 'text-[#1E1E24] !important' 
                        : 'text-[#7C6F64] !important'
                  }`}>
                    {date.getDate()}
                  </span>
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`p-1 rounded text-xs truncate ${
                        getPriorityColor(task.priority)
                      } text-white font-medium`}
                      title={`${task.title} - ${task.priority} priority`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-[#7C6F64] !important text-center">
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
        <h3 className="text-xl font-semibold text-[#1E1E24] !important mb-6">Upcoming Tasks</h3>
        <div className="space-y-4">
          {currentMonthTasks
            .filter(task => task.dueDate && new Date(task.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 10)
            .map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-[#9B5DE5]/5 transition-all duration-300">
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
    </div>
  );
};

