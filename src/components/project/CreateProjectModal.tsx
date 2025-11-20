import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject, currentUser, users } = useApp();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [projectLead, setProjectLead] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Debug: Log users when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('📋 CreateProjectModal opened');
      console.log('👥 Total users:', users.length);
      console.log('👥 Users data:', users);
      console.log('🎯 Project Leads:', users.filter(u => u.role === 'project-lead'));
      console.log('👤 Team Members:', users.filter(u => u.role === 'team-member'));
    }
  }, [isOpen, users]);

  // Filter users by role
  const projectLeads = users.filter(u => u.role === 'project-lead');
  const teamMembers = users.filter(u => u.role === 'team-member');

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) return;
    
    const projectKey = key || name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
    
    // Build members array
    const members = selectedMembers
      .map(id => users.find(u => u.id === id))
      .filter(Boolean);
    
    // Add project lead to members if selected
    if (projectLead) {
      const lead = users.find(u => u.id === projectLead);
      if (lead && !members.find(m => m?.id === projectLead)) {
        members.push(lead);
      }
    }
    
    createProject({
      name,
      key: projectKey,
      description,
      department,
      startDate: new Date(startDate),
      ownerId: currentUser.id,
      createdBy: currentUser.id,
      projectLead: projectLead || undefined,
      members: members as any[],
    });
    
    // Reset form
    setName('');
    setKey('');
    setDescription('');
    setDepartment('');
    setStartDate('');
    setProjectLead('');
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Project Name <span className="text-[#D7263D]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Project Key <span className="text-[#D7263D]">*</span>
          </label>
          <input
            type="text"
            required
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 uppercase"
            placeholder="e.g., PROJ01"
            maxLength={10}
          />
          <p className="text-xs text-[#7C6F64] !important mt-1">Unique short identifier (uppercase letters and numbers)</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Description <span className="text-[#D7263D]">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 resize-none"
            placeholder="Summary of project goals and scope"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Department <span className="text-[#D7263D]">*</span>
          </label>
          <select
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
          >
            <option value="">Select department</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Research & Development">Research & Development</option>
            <option value="IT">IT</option>
          </select>
          <p className="text-xs text-[#7C6F64] !important mt-1">Select the department that owns this project</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Start Date <span className="text-[#D7263D]">*</span>
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Project Lead
          </label>
          <select
            value={projectLead}
            onChange={(e) => setProjectLead(e.target.value)}
            className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
          >
            <option value="">Select project lead (optional)</option>
            {projectLeads.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-[#7C6F64] !important mt-1">Assign a project lead to manage this project</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1E1E24] !important mb-2">
            Team Members
          </label>
          <div className="w-full min-h-[120px] max-h-[200px] overflow-y-auto px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl focus-within:border-[#9B5DE5] focus-within:ring-4 focus-within:ring-[#9B5DE5]/20 transition-all duration-300">
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id!)}
                      onChange={() => handleMemberToggle(user.id!)}
                      className="w-4 h-4 text-[#9B5DE5] border-2 border-[#9B5DE5]/50 rounded focus:ring-2 focus:ring-[#9B5DE5]/30"
                    />
                    <span className="text-sm text-[#1E1E24] font-medium">
                      {user.name}
                      <span className="text-xs text-[#7C6F64] ml-2">({user.email})</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7C6F64] text-center py-8">No team members available</p>
            )}
          </div>
          <p className="text-xs text-[#7C6F64] !important mt-1">Hold Ctrl/Cmd to select multiple members</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t-2 border-[#9B5DE5]/20">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || !key.trim() || !description.trim() || !department || !startDate}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};


