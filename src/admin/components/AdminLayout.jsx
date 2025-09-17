import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen font-sans bg-slate-50 text-gray-800 w-full">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        {/* --- Mobile Header with Hamburger Menu --- */}
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-500 rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold text-sm shadow-md">
              SC
            </div>
            <h1 className="text-lg font-bold text-gray-800">MindEase</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* --- Main Content Area --- */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
