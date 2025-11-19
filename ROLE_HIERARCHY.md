# Role-Based Access Control (RBAC) System

## Overview
This application implements a strict role hierarchy where each role has specific responsibilities and permissions. The system enforces these permissions both on the backend (API level) and frontend (UI level).

## Role Hierarchy

### 1. Team Member
**Primary Function**: Works on tasks assigned by project leads

**Permissions**:
- ✅ View assigned tasks
- ✅ Update task progress and status
- ✅ Mark tasks as complete
- ✅ Add comments to tasks
- ✅ View project board
- ✅ Track personal workload

**Restrictions**:
- ❌ Cannot create projects
- ❌ Cannot create tasks
- ❌ Cannot assign tasks to others
- ❌ Cannot modify project settings
- ❌ Cannot manage users

**Backend Routes**:
- `GET /api/tasks` - View assigned tasks
- `PUT /api/tasks/:id` - Update own tasks
- `POST /api/tasks/:id/comments` - Add comments

---

### 2. Project Lead
**Primary Function**: Manages project tasks and assigns them to team members

**Permissions**:
- ✅ All Team Member permissions
- ✅ Create new tasks within assigned projects
- ✅ Assign tasks to team members
- ✅ Update task priority and status
- ✅ Manage project timeline
- ✅ View project analytics
- ✅ Track team progress

**Restrictions**:
- ❌ Cannot create new projects
- ❌ Cannot modify project-level settings
- ❌ Cannot add/remove project members (only assign tasks)
- ❌ Cannot manage users or system settings

**Backend Routes**:
- `POST /api/tasks` - Create tasks (requires project lead role)
- `PUT /api/tasks/:id` - Update any task in their projects
- `DELETE /api/tasks/:id` - Delete tasks
- `GET /api/projects/:id/analytics` - View project analytics

---

### 3. Department Head
**Primary Function**: Creates projects and assigns project leads

**Permissions**:
- ✅ All Project Lead permissions
- ✅ **Create new projects**
- ✅ **Assign project leads to projects**
- ✅ Modify project settings
- ✅ Add/remove project members
- ✅ View all department projects
- ✅ Access department-wide analytics

**Restrictions**:
- ❌ Cannot manage users (create/edit/delete users)
- ❌ Cannot approve user registrations
- ❌ Cannot create organization codes
- ❌ Cannot modify system settings

**Backend Routes**:
- `POST /api/projects` - Create projects (ONLY department heads)
- `PUT /api/projects/:id` - Modify any project
- `POST /api/projects/:id/members` - Add members
- `PUT /api/projects/:id/lead` - Assign project lead

**Workflow**:
1. Department Head creates a new project
2. Department Head assigns a Project Lead to the project
3. Project Lead creates and manages tasks
4. Project Lead assigns tasks to Team Members

---

### 4. Admin
**Primary Function**: View-only on projects, manages users and system settings

**Permissions**:
- ✅ **View all projects (read-only)**
- ✅ **Manage all users (create, edit, delete, approve)**
- ✅ **Approve user registrations**
- ✅ **Create organization codes**
- ✅ **Manage system settings**
- ✅ View all analytics and reports
- ✅ Access admin panel

**Restrictions**:
- ❌ **CANNOT create projects**
- ❌ **CANNOT modify projects**
- ❌ **CANNOT create tasks**
- ❌ **CANNOT assign tasks**
- ❌ **View-only access to all project-related features**

**Backend Routes**:
- `GET /api/admin/users` - Manage users
- `POST /api/admin/users` - Create users
- `PUT /api/admin/users/:id` - Edit users
- `DELETE /api/admin/users/:id` - Delete users
- `PUT /api/admin/users/:id/approve` - Approve pending users
- `GET /api/admin/organizations` - Manage organization codes
- `POST /api/admin/organizations` - Create organization codes
- `GET /api/projects` - View projects (read-only)

**Key Design Decision**:
Admins are **system administrators**, not project managers. They manage the platform itself (users, settings, organizations) but do not interfere with project work. This keeps project management separate from system administration.

---

## Permission Enforcement

### Backend Middleware

**requireAuth**: Verifies JWT token and loads user
**requireRole(role)**: Checks if user has minimum required role level
**requireAdmin**: Admin-only routes
**requireDepartmentHead**: Department Head or higher
**requireProjectLead**: Project Lead or higher
**canModifyProject**: Checks project modification permissions (blocks admins)

### Frontend Guards

```typescript
// Example permission checks
canCreateProjects(role) // Only department-head returns true
canCreateTasks(role) // Only project-lead and department-head
canModifyProjects(role) // Only department-head and project-lead
canManageUsers(role) // Only admin
isProjectViewOnly(role) // Only admin returns true
canWorkWithProjects(role) // All except admin
```

---

## Workflow Examples

### Example 1: New Project Creation
1. **Department Head** creates a new project "Mobile App v2.0"
2. **Department Head** assigns "John (Project Lead)" as the project lead
3. **John (Project Lead)** creates tasks: "Design UI", "Implement Auth", "Setup Database"
4. **John (Project Lead)** assigns tasks to team members:
   - "Design UI" → Sarah (Team Member)
   - "Implement Auth" → Mike (Team Member)
   - "Setup Database" → Lisa (Team Member)
5. **Team Members** work on and complete their assigned tasks
6. **Admin** can view project progress but cannot modify anything

### Example 2: User Management
1. New user signs up with organization code "ORG001"
2. System creates user with `isApproved: false`
3. **Admin** receives notification of pending approval
4. **Admin** reviews user and clicks "Approve"
5. User can now login and is assigned "Team Member" role by default
6. **Admin** can later promote user to "Project Lead" or "Department Head"

### Example 3: Admin View-Only Access
1. **Admin** navigates to Projects page
2. UI shows "View Only" badge on Projects menu item
3. **Admin** can see all project details, tasks, and members
4. Edit/Delete buttons are hidden for admin
5. If admin tries to modify via API, backend returns 403 error
6. Admin focuses on managing users, approvals, and system settings

---

## Database Schema Updates

### User Model
```javascript
{
  role: {
    type: String,
    enum: ['team-member', 'project-lead', 'department-head', 'admin'],
    default: 'team-member'
  },
  isApproved: Boolean // Admin approval required
}
```

### Project Model
```javascript
{
  owner: ObjectId, // Original owner
  createdBy: ObjectId, // Department Head who created it
  projectLead: ObjectId, // Assigned Project Lead
  members: [{ user: ObjectId, role: String }]
}
```

### Task Model
```javascript
{
  assignee: ObjectId, // Team Member assigned by Project Lead
  reporter: ObjectId, // Project Lead who created the task
  project: ObjectId
}
```

---

## Frontend UI Changes

### Admin Interface
- Projects menu shows "View Only" badge
- No "Create Project" or "Create Task" buttons visible
- No edit/delete options on projects or tasks
- Admin panel emphasized as primary interface

### Department Head Interface
- "Create Project" button prominent
- "Assign Project Lead" option when creating/editing projects
- Can see and manage all department projects

### Project Lead Interface
- "Create Task" button visible within projects
- "Assign Task" dropdown when creating/editing tasks
- Can only manage tasks in assigned projects

### Team Member Interface
- Focused on "My Tasks" view
- Cannot create projects or tasks
- Can update status of assigned tasks only

---

## Testing the Role System

### Test Scenario 1: Admin Cannot Create Projects
```
1. Login as admin@example.com
2. Navigate to Projects page
3. Verify "Create Project" button is not visible
4. Try API call: POST /api/projects
5. Expect: 403 Forbidden "Admins cannot create projects"
```

### Test Scenario 2: Department Head Creates Project
```
1. Login as department-head@example.com
2. Click "Create Project"
3. Fill in project details
4. Assign a Project Lead from dropdown
5. Expect: Project created successfully with projectLead assigned
```

### Test Scenario 3: Project Lead Creates Tasks
```
1. Login as project-lead@example.com
2. Navigate to project (where you are the lead)
3. Click "Create Task"
4. Assign task to a team member
5. Expect: Task created and assigned successfully
```

### Test Scenario 4: Team Member Cannot Create Tasks
```
1. Login as team-member@example.com
2. Navigate to Tasks page
3. Verify "Create Task" button is not visible
4. Try API call: POST /api/tasks
5. Expect: 403 Forbidden "Only Project Leads can create tasks"
```

---

## Migration Notes

### Existing Projects
- Set `createdBy` to current `owner` (assume owner is department head)
- Set `projectLead` to current `owner` if they are project-lead role
- All existing admins lose ability to create/modify projects

### Existing Users
- Users with no role default to 'team-member'
- Admins should review and assign appropriate roles
- No automatic role upgrades - manual admin approval required

---

## Security Considerations

1. **Backend Validation**: All permissions checked server-side, never trust frontend
2. **JWT Claims**: User role included in JWT payload
3. **Middleware Chain**: Multiple layers of auth checks (auth → role → project access)
4. **Audit Logging**: Track who created/modified projects and tasks
5. **Role Changes**: Only admins can change user roles, logged for audit

---

## API Documentation

### Department Head Endpoints
- `POST /api/projects` - Create project
- `PUT /api/projects/:id/lead` - Assign project lead

### Project Lead Endpoints  
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id/assign` - Assign task to team member

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user role
- `PUT /api/admin/users/:id/approve` - Approve pending user
- `GET /api/projects` - View all projects (read-only)

---

## Common Questions

**Q: Can a Project Lead create a project?**
A: No, only Department Heads can create projects.

**Q: Can an Admin modify tasks?**
A: No, Admins have view-only access to project work.

**Q: Can a Department Head assign tasks?**
A: Yes, Department Heads have all Project Lead permissions plus more.

**Q: What happens if a Project Lead is removed?**
A: Department Head must assign a new Project Lead to the project.

**Q: Can a user have multiple roles?**
A: No, each user has exactly one role. Promote users as needed.

**Q: How do I make someone a Project Lead?**
A: Admin changes their role to "Project Lead", then Department Head assigns them to a project.

---

This RBAC system ensures clear separation of responsibilities and prevents permission creep while maintaining flexibility for organizational needs.
