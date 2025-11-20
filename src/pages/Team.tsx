import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Clock, CheckCircle, Trash2, Plus, Users as UsersIcon, Briefcase, Calendar, TrendingUp, FolderOpen, Award, Target, BarChart3, Shield, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddMemberModal } from '../components/team/AddMemberModal';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TeamData {
  projectId: string;
  projectName: string;
  projectKey: string;
  projectDescription: string;
  projectStatus: string;
  userRoleInProject: string;
  joinedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    projectRole: string;
    joinedAt: string;
  }>;
  memberCount: number;
}

export const Team: React.FC = () => {
  const { currentProject, tasks, removeTeamMember, currentUser } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<TeamData[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's teams if they're a team member
  useEffect(() => {
    if (currentUser?.role === 'team-member') {
      fetchMyTeams();
    }
  }, [currentUser]);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching my teams...');
      const [teamsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/users/my-teams`, { headers }),
        axios.get(`${API_URL}/users/team-stats`, { headers })
      ]);
      
      console.log('Teams response:', teamsResponse.data);
      console.log('Stats response:', statsResponse.data);
      
      if (teamsResponse.data.success) {
        const teams = teamsResponse.data.data.teams || [];
        console.log('Setting teams:', teams);
        setMyTeams(teams);
      }
      
      if (statsResponse.data.success) {
        setTeamStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => 
      task.assigneeId === memberId || task.assignee?._id === memberId || task.assignee === memberId
    );
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'done').length,
      inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
      pending: memberTasks.filter(task => task.status === 'todo').length
    };
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-[#D7263D]/20 text-[#D7263D]';
      case 'department-head': return 'bg-[#9B5DE5]/20 text-[#9B5DE5]';
      case 'project-lead': return 'bg-[#00F5D4]/20 text-[#00F5D4]';
      case 'team-member': return 'bg-[#F7B801]/20 text-[#F7B801]';
      default: return 'bg-[#7C6F64]/20 text-[#7C6F64]';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return Shield;
      case 'department-head': return Award;
      case 'project-lead': return Target;
      case 'team-member': return UserCheck;
      default: return User;
    }
  };

  // Team Member View - Show their teams
  if (currentUser?.role === 'team-member') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E1E24] !important mb-2">
            My Teams
          </h1>
          <p className="text-[#7C6F64] !important">
            Projects and teams you're part of
          </p>
        </div>

        {/* Stats Cards */}
        {teamStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card rounded-2xl p-5 border-2 border-[#9B5DE5]/10">
              <div className="flex items-center justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-[#9B5DE5]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">{teamStats.projectCount}</span>
              </div>
              <p className="text-sm font-medium text-[#1E1E24] !important">Projects</p>
              <p className="text-xs text-[#7C6F64] !important">Teams you're in</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#00F5D4]/10">
              <div className="flex items-center justify-between mb-3">
                <Briefcase className="w-8 h-8 text-[#00F5D4]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">{teamStats.assignedTasks}</span>
              </div>
              <p className="text-sm font-medium text-[#1E1E24] !important">My Tasks</p>
              <p className="text-xs text-[#7C6F64] !important">Assigned to you</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#F7B801]/10">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-[#F7B801]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">{teamStats.completedTasks}</span>
              </div>
              <p className="text-sm font-medium text-[#1E1E24] !important">Completed</p>
              <p className="text-xs text-[#7C6F64] !important">Tasks done</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#E07A5F]/10">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-[#E07A5F]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">{teamStats.completionRate}%</span>
              </div>
              <p className="text-sm font-medium text-[#1E1E24] !important">Completion</p>
              <p className="text-xs text-[#7C6F64] !important">Success rate</p>
            </div>
          </div>
        )}

        {/* Teams List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#7C6F64] !important">Loading your teams...</p>
          </div>
        ) : myTeams.length > 0 ? (
          <div className="space-y-4">
            {myTeams.map((team) => (
              <div key={team.projectId} className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-[#1E1E24] !important">{team.projectName}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#9B5DE5]/20 text-[#9B5DE5] font-medium">
                          {team.projectKey}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          team.projectStatus === 'active' ? 'bg-[#00F5D4]/20 text-[#00F5D4]' :
                          team.projectStatus === 'completed' ? 'bg-[#F7B801]/20 text-[#F7B801]' :
                          'bg-[#7C6F64]/20 text-[#7C6F64]'
                        }`}>
                          {team.projectStatus}
                        </span>
                      </div>
                      <p className="text-sm text-[#7C6F64] !important mb-2">{team.projectDescription}</p>
                      <div className="flex items-center space-x-4 text-xs text-[#7C6F64] !important">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4" />
                          <span>{team.memberCount} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDistanceToNow(new Date(team.joinedAt), { addSuffix: true })}</span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-[#E0FBFC] text-[#9B5DE5] font-medium">
                          {team.userRoleInProject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="border-t-2 border-[#9B5DE5]/10 pt-4">
                  <h4 className="text-sm font-semibold text-[#1E1E24] !important mb-3">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {team.teamMembers
                      .filter(member => member.role !== 'department-head')
                      .slice(0, 6)
                      .map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 p-2 rounded-lg bg-[#E0FBFC]/50">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E1E24] !important truncate">{member.name}</p>
                          <p className="text-xs text-[#7C6F64] !important capitalize">{member.role.replace('-', ' ')}</p>
                        </div>
                        {member.role === 'project-lead' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7B801]/20 text-[#F7B801] font-medium">
                            Lead
                          </span>
                        )}
                      </div>
                    ))}
                    {team.teamMembers.filter(m => m.role !== 'department-head').length > 6 && (
                      <div className="flex items-center justify-center p-2 rounded-lg bg-[#9B5DE5]/10 text-[#9B5DE5] text-sm font-medium">
                        +{team.teamMembers.filter(m => m.role !== 'department-head').length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Owner */}
                <div className="border-t-2 border-[#9B5DE5]/10 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-[#1E1E24] !important mb-2">Project Lead</h4>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-[#9B5DE5]/10 to-[#7C3AED]/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-lg flex items-center justify-center text-white font-semibold">
                      {team.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1E1E24] !important">{team.owner.name}</p>
                      <p className="text-xs text-[#7C6F64] !important">{team.owner.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card rounded-2xl">
            <div className="w-16 h-16 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9B5DE5]/20">
              <UsersIcon className="w-8 h-8 text-[#7C6F64]" />
            </div>
            <p className="text-[#7C6F64] !important text-lg mb-2">No teams yet</p>
            <p className="text-[#7C6F64] !important text-sm">You haven't been added to any projects yet.</p>
          </div>
        )}
      </div>
    );
  }

  // Admin View - Organization-wide team overview
  if (currentUser?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">
            Organization Teams
          </h1>
          <p className="text-[#7C6F64] !important text-lg">
            Manage all teams and members across the organization
          </p>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card rounded-2xl p-5 border-2 border-[#9B5DE5]/20 bg-gradient-to-br from-[#9B5DE5]/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <FolderOpen className="w-8 h-8 text-[#9B5DE5]" />
              <span className="text-2xl font-bold text-[#1E1E24] !important">{projects.length}</span>
            </div>
            <p className="text-sm font-bold text-[#1E1E24] !important">Total Projects</p>
            <p className="text-xs text-[#7C6F64] !important">Active teams</p>
          </div>

          <div className="card rounded-2xl p-5 border-2 border-[#00F5D4]/20 bg-gradient-to-br from-[#00F5D4]/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <UsersIcon className="w-8 h-8 text-[#00F5D4]" />
              <span className="text-2xl font-bold text-[#1E1E24] !important">
                {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)}
              </span>
            </div>
            <p className="text-sm font-bold text-[#1E1E24] !important">Team Members</p>
            <p className="text-xs text-[#7C6F64] !important">Across all projects</p>
          </div>

          <div className="card rounded-2xl p-5 border-2 border-[#F7B801]/20 bg-gradient-to-br from-[#F7B801]/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <Briefcase className="w-8 h-8 text-[#F7B801]" />
              <span className="text-2xl font-bold text-[#1E1E24] !important">{tasks.length}</span>
            </div>
            <p className="text-sm font-bold text-[#1E1E24] !important">Total Tasks</p>
            <p className="text-xs text-[#7C6F64] !important">All projects</p>
          </div>

          <div className="card rounded-2xl p-5 border-2 border-[#E07A5F]/20 bg-gradient-to-br from-[#E07A5F]/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-[#E07A5F]" />
              <span className="text-2xl font-bold text-[#1E1E24] !important">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm font-bold text-[#1E1E24] !important">Completion</p>
            <p className="text-xs text-[#7C6F64] !important">Overall rate</p>
          </div>
        </div>

        {/* Projects with Teams */}
        <div className="space-y-4">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const members = project.members || [];
            
            return (
              <div key={project.id} className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-[#1E1E24] !important">{project.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#9B5DE5]/20 text-[#9B5DE5] font-medium">
                          {project.key}
                        </span>
                      </div>
                      <p className="text-sm text-[#7C6F64] !important">{project.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#1E1E24] !important">{members.length} members</div>
                    <div className="text-xs text-[#7C6F64] !important">{projectTasks.length} tasks</div>
                  </div>
                </div>

                {/* Team Members Grid */}
                {members.length > 0 && (
                  <div className="border-t-2 border-[#9B5DE5]/10 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {members
                        .filter((member: any) => {
                          const memberData = member.user || member;
                          const role = memberData.role || member.role;
                          return role !== 'department-head';
                        })
                        .map((member: any) => {
                        const memberData = member.user || member;
                        const RoleIcon = getRoleIcon(memberData.role);
                        const stats = getMemberStats(memberData._id || memberData.id);
                        
                        return (
                          <div key={memberData._id || memberData.id} className="flex items-center space-x-3 p-3 rounded-xl bg-[#E0FBFC]/50 border border-[#9B5DE5]/10">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {memberData.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1E1E24] !important truncate">{memberData.name}</p>
                              <div className="flex items-center space-x-1">
                                <RoleIcon className="w-3 h-3 text-[#7C6F64]" />
                                <span className="text-xs text-[#7C6F64] !important capitalize">{memberData.role?.replace('-', ' ')}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold text-[#1E1E24] !important">{stats.total}</div>
                              <div className="text-xs text-[#7C6F64] !important">tasks</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="text-center py-12 card rounded-2xl">
              <FolderOpen className="w-16 h-16 mx-auto text-[#7C6F64] mb-4" />
              <p className="text-[#7C6F64] !important text-lg">No projects yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Project Lead / Department Head View - Show current project team
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">
          {currentUser?.role === 'department-head' ? 'Department Team' : 'Project Team'}
        </h1>
        <p className="text-[#7C6F64] !important text-lg">
          {currentProject ? `Managing team for ${currentProject.name}` : 'Select a project to manage team'}
        </p>
      </div>

      {currentProject ? (
        <>
          {/* Project Info Card */}
          <div className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/20 bg-gradient-to-br from-[#9B5DE5]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-xl font-bold text-[#1E1E24] !important">{currentProject.name}</h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#9B5DE5]/20 text-[#9B5DE5] font-medium">
                      {currentProject.key}
                    </span>
                  </div>
                  <p className="text-sm text-[#7C6F64] !important">{currentProject.description}</p>
                </div>
              </div>
              {(currentUser?.role === 'department-head' || currentUser?.role === 'project-lead') && (
                <Button onClick={() => setIsAddOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card rounded-2xl p-5 border-2 border-[#9B5DE5]/10">
              <div className="flex items-center justify-between mb-3">
                <UsersIcon className="w-8 h-8 text-[#9B5DE5]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">
                  {currentProject.members?.filter((m: any) => {
                    const role = (m.user?.role || m.role);
                    return role !== 'department-head';
                  }).length || 0}
                </span>
              </div>
              <p className="text-sm font-bold text-[#1E1E24] !important">Team Members</p>
              <p className="text-xs text-[#7C6F64] !important">In project</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#00F5D4]/10">
              <div className="flex items-center justify-between mb-3">
                <Briefcase className="w-8 h-8 text-[#00F5D4]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">
                  {tasks.filter(t => t.projectId === currentProject.id).length}
                </span>
              </div>
              <p className="text-sm font-bold text-[#1E1E24] !important">Total Tasks</p>
              <p className="text-xs text-[#7C6F64] !important">All members</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#F7B801]/10">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-[#F7B801]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">
                  {tasks.filter(t => t.projectId === currentProject.id && t.status === 'done').length}
                </span>
              </div>
              <p className="text-sm font-bold text-[#1E1E24] !important">Completed</p>
              <p className="text-xs text-[#7C6F64] !important">Tasks done</p>
            </div>

            <div className="card rounded-2xl p-5 border-2 border-[#E07A5F]/10">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-[#E07A5F]" />
                <span className="text-2xl font-bold text-[#1E1E24] !important">
                  {(() => {
                    const projectTasks = tasks.filter(t => t.projectId === currentProject.id);
                    return projectTasks.length > 0 
                      ? Math.round((projectTasks.filter(t => t.status === 'done').length / projectTasks.length) * 100)
                      : 0;
                  })()}%
                </span>
              </div>
              <p className="text-sm font-bold text-[#1E1E24] !important">Progress</p>
              <p className="text-xs text-[#7C6F64] !important">Completion rate</p>
            </div>
          </div>

          {/* Team Members Grid */}
          {currentProject.members && currentProject.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProject.members
                .filter((member: any) => {
                  const memberData = member.user || member;
                  const role = memberData.role || member.role;
                  // Only exclude department-heads, show all others
                  return role !== 'department-head';
                })
                .map((member: any) => {
                const memberData = member.user || member;
                const memberId = memberData._id || memberData.id;
                const memberRole = memberData.role || member.role || 'team-member';
                const stats = getMemberStats(memberId);
                const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                const RoleIcon = getRoleIcon(memberRole);

                return (
                  <div key={memberId} className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10 hover:border-[#9B5DE5]/30 transition-all duration-300">
                    {/* Member Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {memberData.name?.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#1E1E24] !important truncate">{memberData.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-[#7C6F64] !important mb-2">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{memberData.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-semibold ${getRoleBadgeColor(memberRole)}`}>
                            <RoleIcon className="w-3 h-3" />
                            <span className="capitalize">{memberRole?.replace('-', ' ')}</span>
                          </span>
                        </div>
                      </div>

                      {(currentUser?.role === 'department-head' || currentUser?.role === 'project-lead') && (
                        <button
                          onClick={() => removeTeamMember(memberId)}
                          className="p-2 text-[#7C6F64] hover:text-[#D7263D] hover:bg-[#D7263D]/20 rounded-lg transition-all duration-300"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Member Stats */}
                    <div className="space-y-3 border-t-2 border-[#9B5DE5]/10 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7C6F64] !important font-medium">Total Tasks</span>
                        <span className="font-bold text-[#1E1E24] !important">{stats.total}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7C6F64] !important font-medium">Completed</span>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-[#F7B801]" />
                          <span className="font-bold text-[#1E1E24] !important">{stats.completed}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7C6F64] !important font-medium">In Progress</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-[#9B5DE5]" />
                          <span className="font-bold text-[#1E1E24] !important">{stats.inProgress}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7C6F64] !important font-medium">Pending</span>
                        <span className="font-bold text-[#7C6F64] !important">{stats.pending}</span>
                      </div>

                      {/* Completion Rate Bar */}
                      <div className="pt-3 border-t border-[#9B5DE5]/10">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[#7C6F64] !important font-medium">Performance</span>
                          <span className="font-bold text-[#1E1E24] !important">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-[#E0FBFC] rounded-full h-3 overflow-hidden border border-[#9B5DE5]/20">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              completionRate >= 75 ? 'bg-gradient-to-r from-[#00F5D4] to-[#00B4D8]' :
                              completionRate >= 50 ? 'bg-gradient-to-r from-[#F7B801] to-[#F59E0B]' :
                              'bg-gradient-to-r from-[#E07A5F] to-[#D7263D]'
                            }`}
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 card rounded-2xl border-2 border-dashed border-[#9B5DE5]/30">
              <div className="w-20 h-20 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9B5DE5]/20">
                <UsersIcon className="w-10 h-10 text-[#7C6F64]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E1E24] !important mb-2">No Team Members Yet</h3>
              <p className="text-[#7C6F64] !important mb-4">Start building your team by adding members</p>
              {(currentUser?.role === 'department-head' || currentUser?.role === 'project-lead') && (
                <Button onClick={() => setIsAddOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 card rounded-2xl">
          <div className="w-20 h-20 bg-[#E0FBFC] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9B5DE5]/20">
            <FolderOpen className="w-10 h-10 text-[#7C6F64]" />
          </div>
          <h3 className="text-xl font-bold text-[#1E1E24] !important mb-2">No Project Selected</h3>
          <p className="text-[#7C6F64] !important">Please select a project to view and manage team members</p>
        </div>
      )}

      <AddMemberModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};