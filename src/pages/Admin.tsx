import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AdminLayout } from '../components/layout/AdminLayout';
import { User, Project, Organization } from '../types';
import { usersAPI, adminAPI } from '../services/api';
import { apiRateLimiter } from '../utils/rateLimiter';

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
            <option value="team-member">Team Member - Works on assigned tasks</option>
            <option value="project-lead">Project Lead - Manages tasks, assigns to team</option>
            <option value="department-head">Department Head - Creates projects, assigns leads</option>
            <option value="admin">Admin - View-only projects, manages users/settings</option>
          </select>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            {formData.role === 'admin' && <p>✓ View-only on projects, manages users and system settings</p>}
            {formData.role === 'department-head' && <p>✓ Creates projects and assigns project leads</p>}
            {formData.role === 'project-lead' && <p>✓ Manages project tasks, assigns them to team members</p>}
            {formData.role === 'team-member' && <p>✓ Works on tasks assigned by project leads</p>}
          </div>
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
            <option value="team-member">Team Member - Works on assigned tasks</option>
            <option value="project-lead">Project Lead - Manages tasks, assigns to team</option>
            <option value="department-head">Department Head - Creates projects, assigns leads</option>
            <option value="admin">Admin - View-only projects, manages users/settings</option>
          </select>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            {formData.role === 'admin' && <p>✓ View-only on projects, manages users and system settings</p>}
            {formData.role === 'department-head' && <p>✓ Creates projects and assigns project leads</p>}
            {formData.role === 'project-lead' && <p>✓ Manages project tasks, assigns them to team members</p>}
            {formData.role === 'team-member' && <p>✓ Works on tasks assigned by project leads</p>}
          </div>
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

type AdminTab = 'dashboard' | 'users' | 'organizations' | 'projects' | 'tasks' | 'system' | 'analytics';

// Create Organization Modal
interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<{ ok: boolean; message?: string }>;
}

const CreateOrgModal: React.FC<CreateOrgModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreatedCode('');
    
    try {
      const result = await onCreate(formData.name, formData.description);
      if (result.ok) {
        setCreatedCode('Organization created! Share the code with your team.');
        setTimeout(() => {
          onClose();
          setFormData({ name: '', description: '' });
          setCreatedCode('');
        }, 3000);
      } else {
        setError(result.message || 'Failed to create organization');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Organization">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter organization name"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Brief description of the organization"
            rows={3}
            disabled={loading}
          />
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        {createdCode && (
          <div className="text-sm text-green-400 bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            {createdCode}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Pending Users Component
const PendingUsersSection: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingUsers();
      if (response.success) {
        setPendingUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    try {
      setActionLoading(userId);
      const response = await adminAPI.approveUser(userId);
      if (response.success) {
        alert(`✅ ${userName} has been approved!`);
        // Remove from pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error: any) {
      alert(`Failed to approve user: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    const reason = prompt(`Enter reason for rejecting ${userName}:`);
    if (!reason) return;

    try {
      setActionLoading(userId);
      const response = await adminAPI.rejectUser(userId, reason);
      if (response.success) {
        alert(`❌ ${userName}'s registration has been rejected.`);
        // Remove from pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error: any) {
      alert(`Failed to reject user: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
          <p className="text-gray-400">Loading pending users...</p>
        </div>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return null; // Don't show section if no pending users
  }

  return (
    <div className="glass rounded-2xl p-6 border-2 border-yellow-500/30">
      <div className="flex items-center space-x-3 mb-4">
        <Bell className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white">Pending Approvals</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          {pendingUsers.length} waiting
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        These users are waiting for admin approval to access the system
      </p>
      <div className="space-y-3">
        {pendingUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-yellow-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-medium text-white">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleApprove(user.id, user.name)}
                disabled={actionLoading === user.id}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              >
                {actionLoading === user.id ? 'Processing...' : '✓ Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(user.id, user.name)}
                disabled={actionLoading === user.id}
              >
                {actionLoading === user.id ? 'Processing...' : '✗ Reject'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Admin: React.FC = () => {
  const { users, projects, tasks, currentUser, createProject, fetchUsers, fetchProjects, fetchTasks } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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
    const allTasks = tasks; // Use tasks as allTasks

    // Calculate analytics
    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u.isActive).length || 0;
    const pendingUsers = users?.filter(u => !u.isApproved).length || 0;
    const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
    const projectLeads = users?.filter(u => u.role === 'project-lead').length || 0;
    const departmentHeads = users?.filter(u => u.role === 'department-head').length || 0;
    const teamMembers = users?.filter(u => u.role === 'team-member').length || 0;
    
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.members && p.members.length > 0).length || 0;
    
    const totalTasks = allTasks?.length || 0;
    const completedTasks = allTasks?.filter(t => t.status === 'done').length || 0;
    const inProgressTasks = allTasks?.filter(t => t.status === 'in-progress').length || 0;
    const todoTasks = allTasks?.filter(t => t.status === 'todo').length || 0;
    const reviewTasks = allTasks?.filter(t => t.status === 'review').length || 0;
    const overdueTasks = allTasks?.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      adminUsers,
      projectLeads,
      departmentHeads,
      teamMembers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
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

  // Fetch organizations
  const fetchOrganizations = React.useCallback(async () => {
    try {
      const result = await adminAPI.getOrganizations();
      if (result.success) {
        setOrganizations(result.data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  }, []);

  // Load organizations when tab changes
  React.useEffect(() => {
    if (activeTab === 'organizations') {
      fetchOrganizations();
    }
  }, [activeTab, fetchOrganizations]);

  const handleCreateOrganization = async (name: string, description: string) => {
    try {
      const result = await adminAPI.createOrganization(name, description);
      if (result.success) {
        await fetchOrganizations();
        return { ok: true };
      }
      return { ok: false, message: result.message };
    } catch (error: any) {
      return { ok: false, message: error.response?.data?.message || 'Failed to create organization' };
    }
  };

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
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-400">{analytics.inProgressTasks}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>

            {/* User Roles Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-xs text-gray-400">Admins</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{analytics.adminUsers}</p>
                <p className="text-xs text-gray-400">System administrators</p>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <UserIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-400">Dept Heads</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{analytics.departmentHeads}</p>
                <p className="text-xs text-gray-400">Department managers</p>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <UserIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400">Project Leads</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{analytics.projectLeads}</p>
                <p className="text-xs text-gray-400">Project managers</p>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs text-gray-400">Team Members</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{analytics.teamMembers}</p>
                <p className="text-xs text-gray-400">Active contributors</p>
              </div>
            </div>
          </div>
        );

      case 'organizations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Organization Management</h2>
              <Button onClick={() => setShowCreateOrg(true)}>
                <Globe className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </div>

            {/* Organizations List */}
            <div className="glass rounded-2xl overflow-hidden">
              {organizations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Organizations</h3>
                  <p className="text-gray-400 mb-4">Create your first organization to start managing users.</p>
                  <Button onClick={() => setShowCreateOrg(true)}>
                    <Globe className="w-4 h-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {organizations.map(org => (
                    <div key={org._id} className="p-6 hover:bg-slate-800/30 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="text-lg font-medium text-white">{org.name}</p>
                              {org.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {org.description && (
                              <p className="text-sm text-gray-400 mb-2">{org.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-blue-400" />
                                <span className="font-mono text-blue-400 font-semibold">{org.code}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{org.memberCount} members</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newStatus = !org.isActive;
                              adminAPI.updateOrganization(org._id, { isActive: newStatus })
                                .then(() => fetchOrganizations())
                                .catch(err => alert('Failed to update: ' + err.message));
                            }}
                          >
                            {org.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Pending Users Section */}
            <PendingUsersSection />
            
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

      default:
        return null;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AdminTab)}>
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

        {showCreateOrg && (
          <CreateOrgModal
            isOpen={showCreateOrg}
            onClose={() => setShowCreateOrg(false)}
            onCreate={handleCreateOrganization}
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


