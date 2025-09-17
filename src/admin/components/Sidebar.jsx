import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2, Users, Book, MessageCircle, CalendarCheck, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', path: '/admin/users', label: 'Users', icon: Users },
    { id: 'resources', path: '/admin/resources', label: 'Resources', icon: Book },
    { id: 'forum', path: '/admin/forum', label: 'Forum', icon: MessageCircle },
    { id: 'bookings', path: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 
          bg-gradient-to-b from-white/90 to-teal-50/80 backdrop-blur-xl shadow-xl
          z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-xl w-10 h-10 flex items-center justify-center text-white font-bold text-lg shadow-md">
              SC
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">MindEase</h1>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1">
          <ul className="space-y-2 px-3">
            {navItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-500'}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
