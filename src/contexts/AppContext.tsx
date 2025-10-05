import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Project, Task, TaskStatus, TaskPriority, TaskType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { authAPI, projectsAPI, tasksAPI, usersAPI } from '../services/api.ts';
import { removeAuthToken, setAuthToken, getAuthToken } from '../utils/auth';
import { apiRateLimiter } from '../utils/rateLimiter';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface AppContextType {
  // Auth state
  currentUser: Partial<User> | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Data state
  users: Partial<User>[];
  projects: Partial<Project>[];
  currentProject: Partial<Project> | null;
  tasks: Partial<Task>[];
  
  // Auth methods
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (name: string, email: string, password: string) => Promise<ApiResponse>;
  logout: () => void;
  
  // Project methods
  fetchProjects: () => Promise<void>;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApiResponse>;
  setCurrentProject: (project: Partial<Project> | null) => void;
  
  // Task methods
  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (taskData: { 
    title: string; 
    description?: string; 
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    projectId: string;
    assigneeId?: string;
    dueDate?: Date | string;
    estimatedHours?: number;
  }) => Promise<ApiResponse<Task>>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<ApiResponse<Task>>;
  
  // User methods
  fetchUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  // Auth state
  const [currentUser, setCurrentUser] = useLocalStorage<Partial<User> | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authFailureCount, setAuthFailureCount] = useState(0);
  
  // Data state
  const [users, setUsers] = useLocalStorage<Partial<User>[]>('users', []);
  const [projects, setProjects] = useLocalStorage<Partial<Project>[]>('projects', []);
  const [currentProject, setCurrentProject] = useLocalStorage<Partial<Project> | null>('currentProject', null);
  const [tasks, setTasks] = useLocalStorage<Partial<Task>[]>('tasks', []);

  // Check if user is authenticated and not blocked by circuit breaker
  const isAuthenticated = !!currentUser && !!getAuthToken() && authFailureCount < 5;

  // Validate authentication on app startup
  useEffect(() => {
    const validateAuth = () => {
      const token = getAuthToken();
      
      console.log('🔍 Auth validation check:', {
        currentUser: currentUser ? 'exists' : 'null',
        token: token ? 'exists' : 'null',
        tokenValue: token ? `${token.substring(0, 20)}...` : 'none'
      });
      
      // If we have a currentUser but no token, clear the user
      if (currentUser && !token) {
        console.log('🔄 Auth validation: User exists but no token found, clearing user');
        setCurrentUser(null);
        removeAuthToken();
        return;
      }
      
      // If we have both user and token, user is authenticated
      if (currentUser && token) {
        console.log('✅ Auth validation: User and token found, user is authenticated');
        return;
      }
      
      console.log('📝 Auth validation: No user or token found');
    };

    validateAuth();
  }, []); // Run only once on app startup

  // Load initial data when authenticated - with rate limiting and circuit breaker
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isAuthenticated && isMounted && authFailureCount < 5) {
        try {
          console.log('📦 AppContext: Loading initial data...');
          setLoading(true);
          await Promise.all([
            fetchProjects(),
            fetchUsers(),
            currentProject ? fetchTasks(currentProject.id) : Promise.resolve()
          ]);
          // Reset failure count on successful load
          setAuthFailureCount(0);
        } catch (err) {
          setError('Failed to load initial data');
          console.error('Initial data load failed:', err);
          // Increment failure count to trigger circuit breaker
          setAuthFailureCount(prev => prev + 1);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else if (authFailureCount >= 5) {
        console.log('🚫 Circuit breaker: Too many auth failures, stopping requests');
        setError('Authentication failed multiple times. Please log in again.');
        setCurrentUser(null);
        removeAuthToken();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    // Add a small delay to prevent rapid fire calls
    const timeoutId = setTimeout(loadInitialData, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated]); // Remove currentProject dependency to prevent excessive calls

  // Auth methods
  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuthToken(token);
        setCurrentUser(user);
        return { success: true };
      } else {
        const errorMessage = response?.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<ApiResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(name, email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuthToken(token);
        setCurrentUser(user);
        return { success: true };
      } else {
        const errorMessage = response?.message || 'Registration failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔐 Logging out user and clearing all data');
    removeAuthToken();
    setCurrentUser(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
    setCurrentProject(null);
    setAuthFailureCount(0); // Reset circuit breaker
    navigate('/login');
  };

  // Project methods
  const fetchProjects = async () => {
    if (authFailureCount >= 5) {
      console.log('🚫 Circuit breaker: Skipping fetchProjects due to auth failures');
      return;
    }
    
    try {
      const response = await projectsAPI.getProjects();
      if (response.success && response.data) {
        setProjects(response.data.projects || response.data);
        setAuthFailureCount(0); // Reset on success
      }
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      if (err?.response?.status === 401) {
        setAuthFailureCount(prev => prev + 1);
      }
      setError('Failed to load projects');
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse> => {
    try {
      setLoading(true);
      // Map frontend field names to backend field names
      const backendProjectData = {
        name: projectData.name,
        key: projectData.key,
        description: projectData.description,
        visibility: 'team',
        tags: []
      };
      
      const response = await projectsAPI.createProject(backendProjectData);
      
      if (response.success && response.data) {
        await fetchProjects();
        return { success: true };
      } else {
        const errorMessage = response?.message || 'Failed to create project';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Task methods
  const fetchTasks = async (projectId?: string) => {
    if (authFailureCount >= 5) {
      console.log('🚫 Circuit breaker: Skipping fetchTasks due to auth failures');
      return;
    }
    
    try {
      const response = await tasksAPI.getTasks(projectId);
      
      if (response.success && response.data) {
        setTasks(response.data.tasks || response.data || []);
        setAuthFailureCount(0); // Reset on success
      }
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      if (err?.response?.status === 401) {
        setAuthFailureCount(prev => prev + 1);
      }
      setError('Failed to load tasks');
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    projectId: string;
    assigneeId?: string;
    dueDate?: Date | string;
    estimatedHours?: number;
  }): Promise<ApiResponse<Task>> => {
    try {
      setLoading(true);
      // Map frontend field names to backend field names
      const backendTaskData = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        type: taskData.type,
        project: taskData.projectId,
        assignee: taskData.assigneeId,
        dueDate: taskData.dueDate,
        estimatedHours: taskData.estimatedHours
      };
      
      const response = await tasksAPI.createTask(backendTaskData);
      
      if (response.success && response.data) {
        await fetchTasks(taskData.projectId);
        return { success: true, data: response.data.task || response.data };
      } else {
        const errorMessage = response?.message || 'Failed to create task';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> => {
    try {
      setLoading(true);
      const response = await tasksAPI.updateTask(taskId, updates);
      
      if (response.success && response.data) {
        await fetchTasks(updates.projectId);
        return { success: true, data: response.data.task || response.data };
      } else {
        const errorMessage = response?.message || 'Failed to update task';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // User methods
  const fetchUsers = async () => {
    if (!apiRateLimiter.canCall('fetchUsers')) return;
    if (authFailureCount >= 5) {
      console.log('🚫 Circuit breaker: Skipping fetchUsers due to auth failures');
      return;
    }
    
    if (currentUser?.role === 'admin') {
      try {
        const usersResponse = await usersAPI.getUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.users || usersResponse.data);
          setAuthFailureCount(0); // Reset on success
        }
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        if (err?.response?.status === 401) {
          setAuthFailureCount(prev => prev + 1);
        }
        setError('Failed to load users');
      }
    }
  };

  const value = {
    // State
    currentUser,
    isAuthenticated,
    loading,
    error,
    users,
    projects,
    currentProject,
    tasks,
    
    // Auth methods
    login,
    register,
    logout,
    
    // Project methods
    fetchProjects,
    createProject,
    setCurrentProject,
    
    // Task methods
    fetchTasks,
    createTask,
    updateTask,
    
    // User methods
    fetchUsers,
  };

  return (
    <AppContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AppContext.Provider>
  );
};
