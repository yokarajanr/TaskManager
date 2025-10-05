import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AdminLayout } from '../components/layout/AdminLayout';
import { User, Project } from '../types';
import { usersAPI } from '../services/api';
import { apiRateLimiter } from '../utils/rateLimiter';
import { RenderTracker } from '../utils/RenderTracker';

type UserRole = 'team-member' | 'project-lead' | 'department-head' | 'admin';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  UserPlus,
  Globe,
  Lock,
  Bell,
  Palette
} from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<{ ok: boolean; message?: string }>;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: boolean; message?: string }>;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: any) => Promise<{ ok: boolean; message?: string }>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role || 'team-member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onUpdate(user.id, formData);
      if (result.ok) {
        onClose();
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (error) {
      setError('An error occurred while updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          >
            <option value="team-member">Team Member</option>
            <option value="project-lead">Project Lead</option>
            <option value="department-head">Department Head</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select the appropriate role based on the user's responsibilities and required access level.
          </p>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team-member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onCreate(formData);
      if (result.ok) {
        onClose();
        setFormData({ name: '', email: '', password: '', role: 'team-member' });
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter user's full name"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter email address"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter password (min 6 characters)"
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          >
            <option value="team-member">Team Member</option>
            <option value="project-lead">Project Lead</option>
            <option value="department-head">Department Head</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { users } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    ownerId: users[0]?.id || '',
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onCreate(formData);
      if (result.ok) {
        onClose();
        setFormData({ name: '', key: '', description: '', ownerId: users[0]?.id || '', members: [] });
      } else {
        setError(result.message || 'Failed to create project');
      }
    } catch (error) {
      setError('An error occurred while creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Key</label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            maxLength={10}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            rows={3}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Owner</label>
          <select
            value={formData.ownerId}
            onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          >
            {users?.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

type AdminTab = 'dashboard' | 'users' | 'projects' | 'tasks' | 'system' | 'analytics';

export const Admin: React.FC = () => {
  const { users, projects, tasks, currentUser, createProject, fetchUsers, fetchProjects, fetchTasks } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Manual refresh function
  const refreshData = async () => {
    if (currentUser?.role === 'admin' && !refreshing && apiRateLimiter.canCall('manualRefresh')) {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchProjects(),
          fetchTasks() // Fetch all tasks for analytics
        ]);
      } catch (error) {
        console.error('Failed to refresh admin data:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  // Stable data fetching function
  const fetchAllData = React.useCallback(async () => {
    console.log('🔍 Admin fetchAllData check:', {
      currentUser: currentUser ? 'exists' : 'null',
      role: currentUser?.role,
      dataLoaded,
      canCall: apiRateLimiter.canCall('initialLoad')
    });
    
    if (currentUser?.role === 'admin' && !dataLoaded && apiRateLimiter.canCall('initialLoad')) {
      try {
        console.log('📊 Admin: Loading initial data...');
        await Promise.all([
          fetchUsers(),
          fetchProjects(),
          fetchTasks()
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    }
  }, [currentUser?.role, dataLoaded, fetchUsers, fetchProjects, fetchTasks]);

  // Initial data loading - only once
  useEffect(() => {
    let mounted = true;
    
    if (mounted && currentUser?.role === 'admin' && !dataLoaded) {
      fetchAllData();
    }
    
    return () => {
      mounted = false;
    };
  }, [fetchAllData]);

  // Auto-refresh interval - separate from initial loading
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (currentUser?.role === 'admin' && dataLoaded) {
      console.log('🔄 Admin: Setting up 30-second auto-refresh');
      
      intervalId = setInterval(() => {
        if (apiRateLimiter.canCall('autoRefresh')) {
          console.log('🔄 Admin: Auto-refreshing (30s interval)');
          refreshData();
        }
      }, 30000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Admin: Cleared auto-refresh interval');
      }
    };
  }, [currentUser?.role, dataLoaded]);

  // Memoized analytics calculations to prevent unnecessary re-renders
  const analytics = React.useMemo(() => {
    console.log('Admin analytics recalculation - Users:', users?.length, 'Projects:', projects?.length, 'Tasks:', tasks?.length, 'Current user role:', currentUser?.role);
    const visitCount = 1250; // Mock visit count
    const allTasks = tasks; // Use tasks as allTasks

    // Calculate analytics
    const totalUsers = users?.length || 0;
    const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
    const totalProjects = projects?.length || 0;
    const totalTasks = allTasks?.length || 0;
    const completedTasks = allTasks?.filter(t => t.status === 'done').length || 0;
    const overdueTasks = allTasks?.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      visitCount,
      totalUsers,
      adminUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate
    };
  }, [users, projects, tasks]);

  // User management functions with real API calls
  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const result = await usersAPI.updateUser(userId, updates);
      return { ok: result.success, message: result.message };
    } catch (error: any) {
      return { ok: false, message: error.response?.data?.message || 'Failed to update user' };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const result = await usersAPI.deleteUser(userId);
      return { ok: result.success, message: result.message || 'User deleted successfully' };
    } catch (error: any) {
      return { ok: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  };

  const handleUpdateUser = React.useCallback(async (userId: string, updates: Partial<User>) => {
    if (!apiRateLimiter.canCall(`updateUser-${userId}`)) {
      return { ok: false, message: 'Too many requests, please wait.' };
    }
    
    const result = await updateUser(userId, updates);
    if (result.ok) {
      // Only refresh users list for update
      console.log('🔄 Admin: Refreshing users after update');
      if (apiRateLimiter.canCall('refreshAfterUpdate')) {
        await fetchUsers();
      }
    }
    return result;
  }, [updateUser, fetchUsers]);

  const handleDeleteUser = React.useCallback(async (userId: string) => {
    if (!apiRateLimiter.canCall(`deleteUser-${userId}`)) return;
    
    setDeleteLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.ok) {
        setShowDeleteConfirm(null);
        // Single targeted refresh instead of multiple calls
        console.log('🔄 Admin: Refreshing data after user deletion');
        if (apiRateLimiter.canCall('refreshAfterDelete')) {
          await fetchUsers();
        }
      } else {
        console.error('Failed to delete user:', result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteUser, fetchUsers]);

  const handleCreateProject = React.useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!apiRateLimiter.canCall('createProject')) {
      return { ok: false, message: 'Too many requests, please wait.' };
    }
    
    try {
      const result = await createProject(projectData);
      if (result.success) {
        // Only refresh projects list for creation
        console.log('🔄 Admin: Refreshing projects after creation');
        if (apiRateLimiter.canCall('refreshProjectsAfterCreate')) {
          await fetchProjects();
        }
      }
      return { ok: result.success, message: result.message };
    } catch (error) {
      return { ok: false, message: 'Failed to create project' };
    }
  }, [createProject, fetchProjects]);

  const handleCreateUser = React.useCallback(async (userData: any) => {
    if (!apiRateLimiter.canCall('createUser')) {
      return { ok: false, message: 'Too many requests, please wait.' };
    }
    
    try {
      const result = await usersAPI.createUser(userData);
      if (result.success) {
        // Only refresh users list for creation
        console.log('🔄 Admin: Refreshing users after creation');
        if (apiRateLimiter.canCall('refreshAfterCreate')) {
          await fetchUsers();
        }
        return { ok: true, message: result.message };
      } else {
        return { ok: false, message: result.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.response?.data?.message || 'Failed to create user' };
    }
  }, [fetchUsers]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need admin privileges to access this page.</p>
          <div className="text-sm text-gray-500 mb-4 p-3 bg-slate-800/50 rounded-lg">
            <p>Current user: {currentUser ? `${currentUser.email} (${currentUser.role})` : 'Not logged in'}</p>
            <p>Required role: admin</p>
          </div>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }



  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                    <FolderOpen className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Projects</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalProjects}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                    <CheckSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalTasks}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">{analytics.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Completed Tasks</p>
                    <p className="text-3xl font-bold text-green-400">{analytics.completedTasks}</p>
                  </div>
                  <CheckSquare className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Overdue Tasks</p>
                    <p className="text-3xl font-bold text-red-400">{analytics.overdueTasks}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift relative">
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400">Mock</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Page Visits</p>
                    <p className="text-3xl font-bold text-blue-400">{analytics.visitCount}</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">User Management</h2>
              <div className="flex items-center space-x-4">
                <Button onClick={() => setShowCreateUser(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <span className="text-sm text-gray-400">{analytics.adminUsers} admins</span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              {!users || users.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
                  <p className="text-gray-400 mb-4">
                    {!users ? 'Users are still loading...' : 'No users have been created yet.'}
                  </p>
                  <Button onClick={() => setShowCreateUser(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create First User
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {users.map(user => (
                  <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-medium text-white">{user.name}</p>
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingUser(user as User)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {user.id !== currentUser.id && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => user.id && setShowDeleteConfirm(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Project Control</h2>
              <Button onClick={() => setShowCreateProject(true)}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {projects?.map(project => (
                  <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-medium text-white">{project.name}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            {project.key}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{project.members?.length || 0} members</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Task Management</h2>
              <Button>
                <CheckSquare className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {tasks?.slice(0, 20).map((task: any) => (
                  <div key={task.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'highest' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        task.priority === 'low' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-lg font-medium text-white">{task.title}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            task.status === 'review' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'bug' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            task.type === 'story' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            task.type === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">General Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Site Name</span>
                    <input 
                      type="text" 
                      defaultValue="Project Bolt" 
                      className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Maintenance Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-medium text-white">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Session Timeout</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Two-Factor Auth</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Push Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Palette className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-medium text-white">Appearance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Theme</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>Dark</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Accent Color</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>Blue</option>
                      <option>Green</option>
                      <option>Purple</option>
                      <option>Orange</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary">Reset to Defaults</Button>
              <Button>Save Settings</Button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Advanced Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">User Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Users (24h)</span>
                    <span className="text-white font-semibold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">New Users (7d)</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">User Retention</span>
                    <span className="text-white font-semibold">78%</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg Response Time</span>
                    <span className="text-white font-semibold">120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-white font-semibold">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Error Rate</span>
                    <span className="text-white font-semibold">0.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Activity Log</h3>
              <div className="space-y-3">
                {[
                  { action: 'User login', user: 'john.doe@example.com', time: '2 minutes ago', type: 'info' },
                  { action: 'Project created', user: 'jane.smith@example.com', time: '15 minutes ago', type: 'success' },
                  { action: 'Task completed', user: 'mike.johnson@example.com', time: '1 hour ago', type: 'success' },
                  { action: 'User role changed', user: 'admin@example.com', time: '2 hours ago', type: 'warning' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' :
                      log.type === 'warning' ? 'bg-yellow-500' :
                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-white">{log.action}</span>
                    <span className="text-gray-400">by {log.user}</span>
                    <span className="text-gray-500 ml-auto">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AdminTab)}>
      <RenderTracker name="Admin" deps={[users, projects, tasks, currentUser, dataLoaded]} />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">
              Admin Control Panel
            </h1>
            <p className="text-gray-200 text-lg">Complete website administration and management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="secondary"
              className="glass border-green-500/30 hover:border-green-400/50 text-green-400 hover:text-green-300 disabled:opacity-50"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>

        {/* Modals */}
        {editingUser && (
          <EditUserModal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            user={editingUser}
            onUpdate={handleUpdateUser}
          />
        )}

        {showCreateUser && (
          <CreateUserModal
            isOpen={showCreateUser}
            onClose={() => setShowCreateUser(false)}
            onCreate={handleCreateUser}
          />
        )}

        {showCreateProject && (
          <CreateProjectModal
            isOpen={showCreateProject}
            onClose={() => setShowCreateProject(false)}
            onCreate={handleCreateProject}
          />
        )}

        {showDeleteConfirm && (
          <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete User</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteUser(showDeleteConfirm!)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};


