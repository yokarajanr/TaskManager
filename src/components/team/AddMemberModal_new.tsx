import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { authAPI } from '../../services/api';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, fetchProjects } = useApp();
  const [memberNames, setMemberNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen && currentProject) {
      fetchAvailableUsers();
    }
  }, [isOpen, currentProject]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/users');
      
      if (response.data.success) {
        const allUsers = response.data.data || [];
        
        // Filter out users already in the project and only show team-member and project-lead
        const currentMemberIds = currentProject?.members?.map((m: any) => {
          const member = m.user || m;
          return member._id || member.id;
        }) || [];
        
        const available = allUsers.filter((user: any) => {
          const userId = user._id || user.id;
          const isNotInProject = !currentMemberIds.includes(userId);
          const isEligibleRole = user.role === 'team-member' || user.role === 'project-lead';
          return isNotInProject && isEligibleRole;
        });
        
        setAvailableUsers(available);
        setSuggestions(available);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load available users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMemberNames(value);
    
    // Simple filtering based on last line of input
    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1].trim().toLowerCase();
    
    if (lastLine) {
      const filtered = availableUsers.filter(user => 
        user.name.toLowerCase().includes(lastLine) || 
        user.email.toLowerCase().includes(lastLine)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(availableUsers);
    }
  };

  const handleSuggestionClick = (user: any) => {
    const lines = memberNames.split('\n').filter(line => line.trim());
    
    // Check if user is already added
    if (lines.some(line => line.trim().toLowerCase() === user.name.toLowerCase())) {
      return;
    }
    
    lines.push(user.name);
    setMemberNames(lines.join('\n'));
    setSuggestions(availableUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !memberNames.trim()) return;

    try {
      setLoading(true);
      setError('');

      // Parse member names from textarea
      const names = memberNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (names.length === 0) {
        setError('Please enter at least one member name');
        return;
      }

      // Match names to users
      const usersToAdd = names.map(name => {
        const user = availableUsers.find(u => 
          u.name.toLowerCase() === name.toLowerCase()
        );
        return user;
      }).filter(Boolean);

      if (usersToAdd.length === 0) {
        setError('No matching users found. Please check the names.');
        return;
      }

      // Add each user to the project
      let successCount = 0;
      let failCount = 0;

      for (const user of usersToAdd) {
        try {
          const response = await authAPI.post(`/projects/${currentProject.id}/members`, {
            userId: user._id || user.id,
            role: 'member'
          });

          if (response.data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          console.error(`Error adding user ${user.name}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        await fetchProjects();
        setMemberNames('');
        
        if (failCount === 0) {
          onClose();
        } else {
          setError(`Added ${successCount} member(s), but ${failCount} failed.`);
        }
      } else {
        setError('Failed to add members to project');
      }
    } catch (err: any) {
      console.error('Error adding members:', err);
      setError(err.response?.data?.message || 'Failed to add members to project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-[#D7263D]/10 border-2 border-[#D7263D]/30 rounded-2xl text-[#D7263D] text-sm">
            {error}
          </div>
        )}

        {loading && availableUsers.length === 0 ? (
          <div className="text-center py-6 text-[#7C6F64]">
            Loading available users...
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="memberNames" className="block text-sm font-bold text-[#1E1E24] mb-2">
                Team Members
              </label>
              <textarea
                id="memberNames"
                value={memberNames}
                onChange={handleInputChange}
                rows={5}
                placeholder="Type member names (one per line)&#10;e.g.,&#10;Dharun&#10;Jane Smith"
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 resize-none font-mono text-sm"
              />
              <p className="text-xs text-[#7C6F64] mt-1">
                Hold Ctrl/Cmd to select multiple members
              </p>
            </div>

            {/* Suggestions panel */}
            {suggestions.length > 0 && memberNames.length > 0 && (
              <div className="max-h-48 overflow-y-auto bg-white border-2 border-[#9B5DE5]/30 rounded-2xl p-2">
                <p className="text-xs font-bold text-[#7C6F64] px-2 py-1">
                  Available members (click to add):
                </p>
                {suggestions.slice(0, 10).map((user) => (
                  <button
                    key={user._id || user.id}
                    type="button"
                    onClick={() => handleSuggestionClick(user)}
                    className="w-full text-left px-3 py-2 hover:bg-[#E0FBFC] rounded-lg transition-colors text-sm"
                  >
                    <div className="font-medium text-[#1E1E24]">{user.name}</div>
                    <div className="text-xs text-[#7C6F64]">
                      {user.email} • {user.role.replace('-', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {availableUsers.length === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-[#7C6F64] mb-2">No users available to add</p>
                <p className="text-xs text-[#7C6F64]">
                  All team members and project leads are already in this project
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="btn-secondary">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !memberNames.trim() || availableUsers.length === 0}
            className="btn-primary"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
