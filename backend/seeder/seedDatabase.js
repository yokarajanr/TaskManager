import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Organization from '../models/Organization.js';
import { connectDB } from '../config/database.js';

dotenv.config();

// Sample organizations
const sampleOrganizations = [
  {
    name: 'Kongu Engineering College',
    code: 'ORG001',
    description: 'Main organization for Kongu Engineering College',
    isActive: true
  },
  {
    name: 'Tech Innovations Inc',
    code: 'ORG002',
    description: 'Technology and innovation company',
    isActive: true
  }
];

// Sample data
const sampleUsers = [
  {
    name: 'Yokarajan Admin',
    email: 'yokarajanr.23it@kongu.edu',
    password: 'password123',
    role: 'admin',
    organizationId: 'ORG001',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'ADMIN2',
    email: 'admin2@gmail.com',
    password: 'password123',
    role: 'admin',
    organizationId: 'ORG002',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'team-member',
    organizationId: 'ORG001',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'password123',
    role: 'department-head',
    organizationId: 'ORG001',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    role: 'team-member',
    organizationId: 'ORG002',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    password: 'password123',
    role: 'department-head',
    organizationId: 'ORG002',
    isActive: true,
    isApproved: true,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face'
  }
];

const sampleProjects = [
  {
    name: 'TaskMaster Pro',
    key: 'TASK',
    description: 'Enterprise task management platform with advanced features',
    department: 'Engineering',
    startDate: new Date('2024-01-15'),
    status: 'active',
    visibility: 'team',
    tags: ['web-app', 'task-management', 'react']
  },
  {
    name: 'Student Portal',
    key: 'STUD',
    description: 'Comprehensive student management system for educational institutions',
    department: 'Engineering',
    startDate: new Date('2024-02-01'),
    status: 'active',
    visibility: 'team',
    tags: ['education', 'student-portal', 'management']
  },
  {
    name: 'Library Management',
    key: 'LIB',
    description: 'Digital library management system with book tracking',
    department: 'IT',
    startDate: new Date('2024-02-20'),
    status: 'active',
    visibility: 'team',
    tags: ['library', 'books', 'management']
  }
];

const sampleTasks = [
  {
    title: 'Database schema design',
    description: 'Design and implement the database structure for the application',
    status: 'done',
    priority: 'high',
    type: 'task',
    estimatedHours: 4
  },
  {
    title: 'User interface development',
    description: 'Create responsive and modern user interface components',
    status: 'in-progress',
    priority: 'medium',
    type: 'story',
    estimatedHours: 8
  },
  {
    title: 'Authentication system',
    description: 'Implement secure user authentication and authorization',
    status: 'todo',
    priority: 'high',
    type: 'task',
    estimatedHours: 6
  },
  {
    title: 'Performance optimization',
    description: 'Optimize application performance and loading times',
    status: 'todo',
    priority: 'highest',
    type: 'bug',
    estimatedHours: 2
  },
  {
    title: 'Testing and deployment',
    description: 'Comprehensive testing and production deployment setup',
    status: 'todo',
    priority: 'medium',
    type: 'epic',
    estimatedHours: 16
  }
];

// Connect to MongoDB using the main database configuration
const connectToDB = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Organization.deleteMany({});
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Seed organizations
const seedOrganizations = async (users) => {
  try {
    const admin1 = users.find(u => u.email === 'yokarajanr.23it@kongu.edu');
    const admin2 = users.find(u => u.email === 'admin2@gmail.com');
    
    const createdOrganizations = [];
    
    // Create organization for admin1
    const org1 = new Organization({
      ...sampleOrganizations[0],
      adminId: admin1._id
    });
    await org1.save();
    createdOrganizations.push(org1);
    console.log(`🏢 Created organization: ${org1.name} (${org1.code})`);
    
    // Create organization for admin2
    const org2 = new Organization({
      ...sampleOrganizations[1],
      adminId: admin2._id
    });
    await org2.save();
    createdOrganizations.push(org2);
    console.log(`🏢 Created organization: ${org2.name} (${org2.code})`);
    
    return createdOrganizations;
  } catch (error) {
    console.error('❌ Error seeding organizations:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        password: userData.password // Let the User model handle password hashing
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${savedUser.name} (${savedUser.email})`);
    }
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed projects
const seedProjects = async (users) => {
  try {
    // Get users by organization
    const org1Users = users.filter(u => u.organizationId === 'ORG001' && u.role !== 'admin');
    const org2Users = users.filter(u => u.organizationId === 'ORG002' && u.role !== 'admin');
    const org1DeptHead = users.find(u => u.organizationId === 'ORG001' && (u.role === 'department-head' || u.role === 'project-lead'));
    const org2DeptHead = users.find(u => u.organizationId === 'ORG002' && u.role === 'department-head');
    
    const createdProjects = [];
    
    // Create 2 projects for ORG001
    for (let i = 0; i < 2; i++) {
      const projectData = sampleProjects[i];
      const project = new Project({
        ...projectData,
        owner: org1DeptHead?._id || org1Users[0]?._id,
        createdBy: org1DeptHead?._id || org1Users[0]?._id,
        organizationId: 'ORG001', // Assign to ORG001
        members: org1Users.slice(0, 2).map(user => ({
          user: user._id,
          role: 'developer'
        }))
      });
      
      const savedProject = await project.save();
      createdProjects.push(savedProject);
      console.log(`📁 Created project for ORG001: ${savedProject.name} (${savedProject.key})`);
    }
    
    // Create 1 project for ORG002
    const projectData = sampleProjects[2];
    const project = new Project({
      ...projectData,
      owner: org2DeptHead?._id || org2Users[0]?._id,
      createdBy: org2DeptHead?._id || org2Users[0]?._id,
      organizationId: 'ORG002', // Assign to ORG002
      members: org2Users.slice(0, 2).map(user => ({
        user: user._id,
        role: 'developer'
      }))
    });
    
    const savedProject = await project.save();
    createdProjects.push(savedProject);
    console.log(`📁 Created project for ORG002: ${savedProject.name} (${savedProject.key})`);
    
    return createdProjects;
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  }
};

// Seed tasks
const seedTasks = async (users, projects) => {
  try {
    const createdTasks = [];
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const project = projects[i % projects.length]; // Distribute tasks across projects
      
      // Get users from the same organization as the project
      const projectUsers = users.filter(u => 
        u.organizationId === project.organizationId && u.role !== 'admin'
      );
      const projectLead = projectUsers.find(u => u.role === 'project-lead' || u.role === 'department-head');
      const assignee = projectUsers[i % projectUsers.length]; // Alternate assignees from same org
      
      const task = new Task({
        ...taskData,
        project: project._id,
        organizationId: project.organizationId, // Inherit from project
        assignee: assignee?._id,
        reporter: projectLead?._id || projectUsers[0]?._id,
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) // Due in i+1 days
      });
      
      const savedTask = await task.save();
      createdTasks.push(savedTask);
      console.log(`✅ Created task for ${project.organizationId}: ${savedTask.title}`);
    }
    
    return createdTasks;
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectToDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data
    console.log('\n👥 Seeding users...');
    const users = await seedUsers();
    
    console.log('\n🏢 Seeding organizations...');
    const organizations = await seedOrganizations(users);
    
    console.log('\n📁 Seeding projects...');
    const projects = await seedProjects(users);
    
    console.log('\n✅ Seeding tasks...');
    const tasks = await seedTasks(users, projects);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${users.length} users, ${organizations.length} organizations, ${projects.length} projects, and ${tasks.length} tasks`);
    
    // Display admin credentials
    console.log('\n🔑 Admin 1 Login Credentials:');
    console.log(`   Email: yokarajanr.23it@kongu.edu`);
    console.log(`   Password: password123`);
    console.log(`   Organization: ${organizations[0].name} (${organizations[0].code})`);
    
    console.log('\n🔑 Admin 2 Login Credentials:');
    console.log(`   Email: admin2@gmail.com`);
    console.log(`   Password: password123`);
    console.log(`   Organization: ${organizations[1].name} (${organizations[1].code})`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = new URL(import.meta.url).pathname;
  const scriptPath = process.argv[1];
  
  if (modulePath.includes('seedDatabase.js')) {
    seedDatabase();
  }
}

export default seedDatabase;
