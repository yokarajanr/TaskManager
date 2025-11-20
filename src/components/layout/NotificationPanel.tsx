import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Task, Project, User } from '../../types';
import { CheckCircle2, AlertCircle, FolderPlus, UserPlus, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'task-assigned' | 'project-assigned' | 'task-overdue' | 'project-created' | 'member-added' | 'task-completed';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { currentUser, tasks, projects, users } = useApp();
  const navigate = useNavigate();

  const notifications = useMemo(() => {
    if (!currentUser) return [];

    const notifs: Notification[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Role-based notifications
    switch (currentUser.role) {
      case 'team-member':
        // Tasks assigned to this team member
        const assignedTasks = tasks.filter(task => 
          task.assigneeId === currentUser.id && 
          task.status !== 'done'
        );

        assignedTasks.forEach(task => {
          const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
          if (taskDate > sevenDaysAgo) {
            notifs.push({
              id: `task-${task.id}`,
              type: 'task-assigned',
              title: 'New Task Assigned',
              description: `You have been assigned: "${task.title}"`,
              timestamp: taskDate,
              isRead: false,
              actionUrl: '/board',
              priority: task.priority === 'highest' || task.priority === 'high' ? 'high' : 'medium'
            });
          }
        });

        // Overdue tasks
        const overdueTasks = tasks.filter(task => 
          task.assigneeId === currentUser.id && 
          task.dueDate && 
          new Date(task.dueDate) < now &&
          task.status !== 'done'
        );

        overdueTasks.forEach(task => {
          notifs.push({
            id: `overdue-${task.id}`,
            type: 'task-overdue',
            title: 'Task Overdue',
            description: `"${task.title}" is past its due date`,
            timestamp: task.dueDate ? new Date(task.dueDate) : now,
            isRead: false,
            actionUrl: '/board',
            priority: 'high'
          });
        });

        // Project assignments
        const memberProjects = projects.filter(project => 
          project.members?.some(member => member.id === currentUser.id)
        );

        memberProjects.forEach(project => {
          const projectDate = project.createdAt ? new Date(project.createdAt) : new Date();
          if (projectDate > sevenDaysAgo) {
            notifs.push({
              id: `project-${project.id}`,
              type: 'project-assigned',
              title: 'Added to Project',
              description: `You have been added to project: "${project.name}"`,
              timestamp: projectDate,
              isRead: false,
              actionUrl: '/projects',
              priority: 'medium'
            });
          }
        });
        break;

      case 'project-lead':
        // Projects assigned as lead
        const leadProjects = projects.filter(project => 
          project.projectLead === currentUser.id
        );

        leadProjects.forEach(project => {
          const projectDate = project.createdAt ? new Date(project.createdAt) : new Date();
          if (projectDate > sevenDaysAgo) {
            notifs.push({
              id: `lead-project-${project.id}`,
              type: 'project-assigned',
              title: 'Assigned as Project Lead',
              description: `You are now leading: "${project.name}"`,
              timestamp: projectDate,
              isRead: false,
              actionUrl: '/projects',
              priority: 'high'
            });
          }
        });

        // Tasks in lead's projects
        const projectIds = leadProjects.map(p => p.id);
        const projectTasks = tasks.filter(task => 
          projectIds.includes(task.projectId)
        );

        // New tasks created
        const newTasks = projectTasks.filter(task => {
          const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
          return taskDate > sevenDaysAgo;
        });

        if (newTasks.length > 0) {
          notifs.push({
            id: `new-tasks-batch`,
            type: 'task-assigned',
            title: 'New Tasks in Your Projects',
            description: `${newTasks.length} new task${newTasks.length > 1 ? 's' : ''} created in your projects`,
            timestamp: new Date(),
            isRead: false,
            actionUrl: '/board',
            priority: 'medium'
          });
        }

        // Completed tasks
        const completedTasks = projectTasks.filter(task => {
          const taskDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
          return task.status === 'done' && taskDate > sevenDaysAgo;
        });

        if (completedTasks.length > 0) {
          notifs.push({
            id: `completed-tasks-batch`,
            type: 'task-completed',
            title: 'Tasks Completed',
            description: `${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} completed in your projects`,
            timestamp: new Date(),
            isRead: false,
            actionUrl: '/board',
            priority: 'low'
          });
        }

        // Overdue tasks in projects
        const projectOverdueTasks = projectTasks.filter(task => 
          task.dueDate && 
          new Date(task.dueDate) < now &&
          task.status !== 'done'
        );

        if (projectOverdueTasks.length > 0) {
          notifs.push({
            id: `overdue-batch`,
            type: 'task-overdue',
            title: 'Overdue Tasks',
            description: `${projectOverdueTasks.length} task${projectOverdueTasks.length > 1 ? 's are' : ' is'} overdue in your projects`,
            timestamp: now,
            isRead: false,
            actionUrl: '/board',
            priority: 'high'
          });
        }
        break;

      case 'department-head':
        // All projects in department
        const deptProjects = projects.filter(project => 
          project.createdBy === currentUser.id || project.ownerId === currentUser.id
        );

        // New projects created
        const newProjects = deptProjects.filter(project => {
          const projectDate = project.createdAt ? new Date(project.createdAt) : new Date();
          return projectDate > sevenDaysAgo;
        });

        newProjects.forEach(project => {
          notifs.push({
            id: `dept-project-${project.id}`,
            type: 'project-created',
            title: 'New Project Created',
            description: `Project "${project.name}" has been created in your department`,
            timestamp: project.createdAt ? new Date(project.createdAt) : now,
            isRead: false,
            actionUrl: '/projects',
            priority: 'medium'
          });
        });

        // Department overview
        const deptProjectIds = deptProjects.map(p => p.id);
        const deptTasks = tasks.filter(task => 
          deptProjectIds.includes(task.projectId)
        );

        const deptActiveTasks = deptTasks.filter(task => task.status !== 'done');
        const deptCompletedTasks = deptTasks.filter(task => {
          const taskDate = task.updatedAt ? new Date(task.updatedAt) : new Date();
          return task.status === 'done' && taskDate > sevenDaysAgo;
        });

        if (deptCompletedTasks.length > 0) {
          notifs.push({
            id: `dept-completed`,
            type: 'task-completed',
            title: 'Department Progress',
            description: `${deptCompletedTasks.length} task${deptCompletedTasks.length > 1 ? 's' : ''} completed across ${deptProjects.length} project${deptProjects.length > 1 ? 's' : ''}`,
            timestamp: now,
            isRead: false,
            actionUrl: '/projects',
            priority: 'low'
          });
        }

        // Overdue tasks in department
        const deptOverdueTasks = deptTasks.filter(task => 
          task.dueDate && 
          new Date(task.dueDate) < now &&
          task.status !== 'done'
        );

        if (deptOverdueTasks.length > 0) {
          notifs.push({
            id: `dept-overdue`,
            type: 'task-overdue',
            title: 'Department Alert',
            description: `${deptOverdueTasks.length} overdue task${deptOverdueTasks.length > 1 ? 's' : ''} in your department`,
            timestamp: now,
            isRead: false,
            actionUrl: '/projects',
            priority: 'high'
          });
        }
        break;

      case 'admin':
        // System-wide overview
        const recentProjects = projects.filter(project => {
          const projectDate = project.createdAt ? new Date(project.createdAt) : new Date();
          return projectDate > sevenDaysAgo;
        });

        if (recentProjects.length > 0) {
          notifs.push({
            id: `admin-projects`,
            type: 'project-created',
            title: 'New Projects Created',
            description: `${recentProjects.length} new project${recentProjects.length > 1 ? 's' : ''} created in the organization`,
            timestamp: now,
            isRead: false,
            actionUrl: '/admin',
            priority: 'medium'
          });
        }

        const recentUsers = users.filter(user => {
          const userDate = user.createdAt ? new Date(user.createdAt) : new Date();
          return userDate > sevenDaysAgo && user.id !== currentUser.id;
        });

        if (recentUsers.length > 0) {
          notifs.push({
            id: `admin-users`,
            type: 'member-added',
            title: 'New Users Registered',
            description: `${recentUsers.length} new user${recentUsers.length > 1 ? 's' : ''} joined the organization`,
            timestamp: now,
            isRead: false,
            actionUrl: '/admin',
            priority: 'low'
          });
        }

        // Pending approvals
        const pendingUsers = users.filter(user => !user.isApproved && user.isActive);
        if (pendingUsers.length > 0) {
          notifs.push({
            id: `admin-pending`,
            type: 'member-added',
            title: 'Pending Approvals',
            description: `${pendingUsers.length} user${pendingUsers.length > 1 ? 's' : ''} waiting for approval`,
            timestamp: now,
            isRead: false,
            actionUrl: '/admin',
            priority: 'high'
          });
        }

        // System stats
        const totalActiveTasks = tasks.filter(task => task.status !== 'done');
        if (totalActiveTasks.length > 20) {
          notifs.push({
            id: `admin-tasks`,
            type: 'task-assigned',
            title: 'System Activity',
            description: `${totalActiveTasks.length} active tasks across ${projects.length} projects`,
            timestamp: now,
            isRead: false,
            actionUrl: '/admin',
            priority: 'low'
          });
        }
        break;
    }

    // Sort by priority and timestamp
    return notifs.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityWeight[b.priority || 'low'] - priorityWeight[a.priority || 'low']);
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [currentUser, tasks, projects, users]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task-assigned':
        return <CheckCircle2 className="w-5 h-5 text-[#00F5D4]" />;
      case 'task-overdue':
        return <AlertCircle className="w-5 h-5 text-[#D7263D]" />;
      case 'project-assigned':
      case 'project-created':
        return <FolderPlus className="w-5 h-5 text-[#9B5DE5]" />;
      case 'member-added':
        return <UserPlus className="w-5 h-5 text-[#F7B801]" />;
      case 'task-completed':
        return <TrendingUp className="w-5 h-5 text-[#00F5D4]" />;
      default:
        return <Clock className="w-5 h-5 text-[#7C6F64]" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-[#D7263D]';
      case 'medium':
        return 'border-l-4 border-l-[#F7B801]';
      case 'low':
        return 'border-l-4 border-l-[#00F5D4]';
      default:
        return 'border-l-4 border-l-[#7C6F64]/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-[#9B5DE5]/20 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9B5DE5] to-[#00F5D4] p-4">
        <h3 className="text-lg font-bold text-white">Notifications</h3>
        <p className="text-sm text-white/80">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#9B5DE5]" />
            </div>
            <p className="text-[#7C6F64] font-medium">No new notifications</p>
            <p className="text-sm text-[#7C6F64]/60 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#7C6F64]/10">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-[#E0FBFC]/30 transition-all duration-200 cursor-pointer ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-[#9B5DE5]/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold text-[#1E1E24]">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-[#D7263D] rounded-full ml-2 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-[#7C6F64] mt-1 line-clamp-2">{notification.description}</p>
                    <p className="text-xs text-[#7C6F64]/60 mt-2">{formatTimeAgo(notification.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 bg-[#E0FBFC]/20 border-t border-[#9B5DE5]/10">
          <button 
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-[#9B5DE5] hover:text-[#7C3AED] transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
