// Utility to clear all authentication and app data
export const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication and app data');
  
  // Remove auth token
  localStorage.removeItem('taskmaster_token');
  
  // Remove user data
  localStorage.removeItem('currentUser');
  localStorage.removeItem('users');
  localStorage.removeItem('projects');
  localStorage.removeItem('tasks');
  localStorage.removeItem('currentProject');
  
  // Clear any other app-specific data
  localStorage.removeItem('dataLoaded');
  localStorage.removeItem('authFailureCount');
  
  console.log('✅ All auth data cleared');
};

export const forceLogout = () => {
  clearAllAuthData();
  window.location.href = '/login';
};