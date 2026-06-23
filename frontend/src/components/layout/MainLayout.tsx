import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-sky-500/30">
      {/* 1. Full Width Header on top */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* 2. Sub-container for Sidebar + Page Content */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar wrapper */}
        <Sidebar isExpanded={isExpanded} />

        {/* Backdrop for mobile layout overlay */}
        {isExpanded && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Content Viewport */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}