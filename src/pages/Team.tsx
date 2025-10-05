import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Clock, CheckCircle, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddMemberModal } from '../components/team/AddMemberModal';

export const Team: React.FC = () => {
  const { currentProject, tasks, removeTeamMember } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.assigneeId === memberId);
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'done').length,
      inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
      pending: memberTasks.filter(task => task.status === 'todo').length
    };
  };

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