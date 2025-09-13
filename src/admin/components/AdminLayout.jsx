import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800 w-full">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* The Outlet will render the specific page component for the current route */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}