import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// The import path is now more specific
import { Icon } from './Shared.jsx';

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'users', path: '/admin/users', label: 'Users', icon: 'users' },
    { id: 'resources', path: '/admin/resources', label: 'Resources', icon: 'resources' },
    { id: 'forum', path: '/admin/forum', label: 'Forum', icon: 'forum' },
    { id: 'bookings', path: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Icon name="logo" className="text-teal-500 w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">StudentCare</h1>
        </div>
      </div>
      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 mx-4 rounded-lg transition-colors duration-200 ${location.pathname.startsWith(item.path)
                    ? 'bg-teal-50 text-teal-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon name={item.icon} className="mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

