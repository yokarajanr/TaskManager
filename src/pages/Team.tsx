import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Clock, CheckCircle, Trash2, Plus, Users as UsersIcon, Briefcase, Calendar, TrendingUp, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddMemberModal } from '../components/team/AddMemberModal';
import { formatDistanceToNow } from 'date-fns';
import { authAPI } from '../services/api';

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
      const [teamsResponse, statsResponse] = await Promise.all([
        authAPI.get('/users/my-teams'),
        authAPI.get('/users/team-stats')
      ]);
      
      if (teamsResponse.data.success) {
        setMyTeams(teamsResponse.data.data.teams);
      }
      
      if (statsResponse.data.success) {
        setTeamStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.assigneeId === memberId);
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'done').length,
      inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
      pending: memberTasks.filter(task => task.status === 'todo').length
    };
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
                    {team.teamMembers.slice(0, 6).map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 p-2 rounded-lg bg-[#E0FBFC]/50">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E1E24] !important truncate">{member.name}</p>
                          <p className="text-xs text-[#7C6F64] !important capitalize">{member.projectRole}</p>
                        </div>
                        {team.owner.id === member.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7B801]/20 text-[#F7B801] font-medium">
                            Lead
                          </span>
                        )}
                      </div>
                    ))}
                    {team.memberCount > 6 && (
                      <div className="flex items-center justify-center p-2 rounded-lg bg-[#9B5DE5]/10 text-[#9B5DE5] text-sm font-medium">
                        +{team.memberCount - 6} more
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

  // Project Lead / Department Head / Admin View - Show current project team

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Team</h1>
        <p className="text-[#7C6F64] !important text-lg">
          {currentProject ? `Team members for ${currentProject.name}` : 'No project selected'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Members */}
      {currentProject?.members ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProject.members.map(member => {
            const stats = getMemberStats(member.id);
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <div key={member.id} className="card rounded-2xl p-6 border-2 border-[#9B5DE5]/10">
                {/* Member Info */}
                <div className="flex items-center space-x-4 mb-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#9B5DE5]/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1E1E24] !important">{member.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-[#7C6F64] !important">
                      <Mail className="w-3 h-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="p-2 text-[#7C6F64] hover:text-[#D7263D] hover:bg-[#D7263D]/20 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7C6F64] !important">Total Tasks</span>
                    <span className="font-medium text-[#1E1E24] !important">{stats.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7C6F64] !important">Completed</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-[#F7B801]" />
                      <span className="font-medium text-[#1E1E24] !important">{stats.completed}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7C6F64] !important">In Progress</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#9B5DE5]" />
                      <span className="font-medium text-[#1E1E24] !important">{stats.inProgress}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7C6F64] !important">Pending</span>
                    <span className="font-medium text-[#7C6F64] !important">{stats.pending}</span>
                  </div>

                  {/* Completion Rate */}
                  <div className="pt-2 border-t border-[#9B5DE5]/20">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#7C6F64] !important">Completion Rate</span>
                      <span className="font-medium text-[#1E1E24] !important">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-[#7C6F64]/20 rounded-full h-2">
                      <div
                        className="bg-[#F7B801] h-2 rounded-full transition-all duration-300"
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
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-[#7C6F64] mb-4" />
          <h3 className="text-lg font-medium text-[#1E1E24] !important mb-2">No Team Members</h3>
          <p className="text-[#7C6F64] !important">Select a project to view team members</p>
        </div>
      )}

      <AddMemberModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};