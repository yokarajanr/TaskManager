import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Bell, Search, Settings, User, LogOut, Menu, X, Plus, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopNavigation: React.FC = () => {
  const { currentUser, logout, tasks, projects, users, currentProject, setCurrentProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const projectSelectorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Check if user role works with projects (not admin)
  const canWorkWithProjects = currentUser.role && ['team-member', 'project-lead', 'department-head'].includes(currentUser.role);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: Array<{type: string; id: string; title: string; description: string; status?: string; priority?: string; key?: string; role?: string}> = [];
    const lowerQuery = query.toLowerCase();

    // Search in tasks
    tasks.forEach(task => {
      if (task.title?.toLowerCase().includes(lowerQuery) || 
          task.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'task',
          id: task.id || '',
          title: task.title || '',
          description: task.description || '',
          status: task.status,
          priority: task.priority
        });
      }
    });

    // Search in projects
    projects.forEach(project => {
      if (project.name?.toLowerCase().includes(lowerQuery) || 
          project.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'project',
          id: project.id || '',
          title: project.name || '',
          description: project.description || '',
          key: project.key
        });
      }
    });

    // Search in users
    users.forEach(user => {
      if (user.name?.toLowerCase().includes(lowerQuery) || 
          user.email?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'user',
          id: user.id || '',
          title: user.name || '',
          description: user.email || '',
          role: user.role
        });
      }
    });

    setSearchResults(results.slice(0, 8));
    setShowSearchResults(true);
  };

  // Handle result click
  const handleResultClick = (result: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    switch (result.type) {
      case 'task':
        navigate(`/tasks`);
        break;
      case 'project':
        navigate(`/dashboard`);
        break;
      case 'user':
        navigate(`/team`);
        break;
    }
  };

  // Close search results and project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (projectSelectorRef.current && !projectSelectorRef.current.contains(event.target as Node)) {
        setShowProjectSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block glass border-b-2 border-[#9B5DE5]/20 sticky top-0 z-40">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E1E24] !important">
                  TaskMaster Pro
                </h1>
                <p className="text-xs text-[#7C6F64] !important">Enterprise Task Management</p>
              </div>
            </div>

            {/* Project Selector - Only for roles that work with projects */}
            {canWorkWithProjects && (
              <div className="relative flex-shrink-0" ref={projectSelectorRef}>
                <button
                  onClick={() => setShowProjectSelector(!showProjectSelector)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-xl text-[#1E1E24] hover:border-[#9B5DE5] focus:outline-none focus:border-[#9B5DE5] focus:ring-2 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                >
                  <FolderOpen className="w-4 h-4 text-[#9B5DE5]" />
                  <div className="text-left">
                    <p className="text-xs text-[#7C6F64]">Current Project</p>
                    <p className="text-sm font-semibold text-[#1E1E24] truncate max-w-[180px]">
                      {currentProject ? currentProject.name : 'Select Project'}
                    </p>
                  </div>
                  <svg className={`w-3 h-3 text-[#7C6F64] transition-transform ${showProjectSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {/* Project Dropdown */}
              {showProjectSelector && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#E0FBFC] rounded-2xl border-2 border-[#9B5DE5]/20 shadow-2xl z-50 max-h-96 overflow-y-auto min-w-[320px]">
                  <div className="p-4">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <div
                          key={project.id || project._id}
                          onClick={() => {
                            setCurrentProject(project);
                            setShowProjectSelector(false);
                          }}
                          className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover-lift ${
                            (currentProject?.id === project.id || currentProject?._id === project._id)
                              ? 'bg-[#9B5DE5]/20 border-2 border-[#9B5DE5]'
                              : 'hover:bg-[#9B5DE5]/10'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1E1E24] truncate">{project.name}</p>
                            <p className="text-xs text-[#7C6F64] truncate">{project.description || 'No description'}</p>
                            {project.key && (
                              <span className="text-xs text-[#7C6F64] mt-1 font-mono">{project.key}</span>
                            )}
                          </div>
                          {(currentProject?.id === project.id || currentProject?._id === project._id) && (
                            <svg className="w-5 h-5 text-[#9B5DE5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-[#7C6F64]">No projects available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Search Bar */}
            <div className="flex-1 max-w-lg relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7C6F64]" />
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-xl text-[#1E1E24] placeholder-[#7C6F64] text-sm focus:outline-none focus:border-[#9B5DE5] focus:ring-2 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7C6F64] hover:text-[#1E1E24]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#E0FBFC] rounded-2xl border-2 border-[#9B5DE5]/20 shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="flex items-center space-x-4 p-4 rounded-xl hover:bg-[#9B5DE5]/10 cursor-pointer transition-all duration-200 hover-lift"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          result.type === 'task' ? 'bg-[#F7B801]/20 text-[#F7B801]' :
                          result.type === 'project' ? 'bg-[#00F5D4]/20 text-[#00F5D4]' :
                          'bg-[#9B5DE5]/20 text-[#9B5DE5]'
                        }`}>
                          {result.type === 'task' && <Search className="w-5 h-5" />}
                          {result.type === 'project' && <Search className="w-5 h-5" />}
                          {result.type === 'user' && <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E1E24] truncate">{result.title}</p>
                          <p className="text-xs text-[#7C6F64] truncate">{result.description}</p>
                          {result.type === 'task' && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                result.status === 'done' ? 'status-success' :
                                result.status === 'in-progress' ? 'status-info' :
                                result.status === 'review' ? 'status-warning' :
                                'bg-[#7C6F64]/20 text-[#7C6F64]'
                              }`}>
                                {result.status}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                result.priority === 'high' || result.priority === 'highest' ? 'status-danger' :
                                result.priority === 'medium' ? 'status-warning' :
                                'status-success'
                              }`}>
                                {result.priority}
                              </span>
                            </div>
                          )}
                          {result.type === 'project' && (
                            <span className="text-xs text-[#7C6F64] mt-1">Project • {result.key}</span>
                          )}
                          {result.type === 'user' && (
                            <span className="text-xs text-[#7C6F64] mt-1 capitalize">{result.role || 'user'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#E0FBFC] rounded-2xl border-2 border-[#9B5DE5]/20 shadow-2xl z-50 p-6">
                  <p className="text-[#7C6F64] text-center">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Notifications */}
              <button className="relative p-2 text-[#1E1E24] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D7263D] rounded-full ring-2 ring-white"></span>
              </button>

              {/* Settings */}
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-[#1E1E24] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2 ml-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-[#E0FBFC] rounded-xl border-2 border-[#9B5DE5]/20 hover:border-[#9B5DE5]/40 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-sm font-semibold text-[#1E1E24] !important">{currentUser.name}</p>
                    <p className="text-xs text-[#7C6F64] !important capitalize">{currentUser.role || 'Admin'}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-[#1E1E24] hover:text-[#D7263D] hover:bg-[#D7263D]/10 rounded-xl transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden glass border-b-2 border-[#9B5DE5]/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center glow">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                                 <h1 className="text-lg font-bold text-[#1E1E24] !important">TaskMaster Pro</h1>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-[#1E1E24] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7C6F64]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              />
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#E0FBFC] rounded-xl border-2 border-[#9B5DE5]/20 shadow-2xl z-50 max-h-64 overflow-y-auto">
                <div className="p-3">
                  {searchResults.slice(0, 4).map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#9B5DE5]/10 cursor-pointer transition-all duration-200"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        result.type === 'task' ? 'bg-[#F7B801]/20 text-[#F7B801]' :
                        result.type === 'project' ? 'bg-[#00F5D4]/20 text-[#00F5D4]' :
                        'bg-[#9B5DE5]/20 text-[#9B5DE5]'
                      }`}>
                        {result.type === 'task' && <Search className="w-4 h-4" />}
                        {result.type === 'project' && <Search className="w-4 h-4" />}
                        {result.type === 'user' && <User className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1E1E24] truncate">{result.title}</p>
                        <p className="text-xs text-[#7C6F64] truncate">{result.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="mt-3 p-4 bg-[#E0FBFC] rounded-xl border-2 border-[#9B5DE5]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E1E24] !important">{currentUser.name}</p>
                    <p className="text-xs text-[#7C6F64] !important capitalize">{currentUser.role || 'user'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="p-2 text-[#1E1E24] hover:text-[#D7263D] hover:bg-[#D7263D]/10 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center justify-around">
                <button className="p-3 text-[#1E1E24] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-3 text-[#1E1E24] hover:text-[#9B5DE5] hover:bg-[#9B5DE5]/10 rounded-xl transition-all duration-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
