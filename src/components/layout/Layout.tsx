import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { SidePanel } from './SidePanel';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEDD5] via-[#E0FBFC] to-[#FFEDD5]">
      {/* Top Navigation Bar */}
      <TopNavigation />
      
      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Side Panel */}
        <SidePanel />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};