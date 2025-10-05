export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string;
  role?: 'team-member' | 'project-lead' | 'department-head' | 'admin';
  updatedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: User[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  IN_REVIEW = 'review',
  DONE = 'done'
}

export enum TaskPriority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest'
}

export enum TaskType {
  STORY = 'story',
  TASK = 'task',
  BUG = 'bug',
  EPIC = 'epic',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  assignee?: User;
  reporterId: string;
  reporter: User;
  projectId: string;
  project?: Project;
  createdAt: Date | string;
  updatedAt: Date | string;
  dueDate?: Date | string;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}