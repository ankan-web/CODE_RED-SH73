import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// --- SVG Icons ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8-9 8s9 3.582 9 8z" /></svg>;
const ResourcesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const ForumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6l4 4z" /></svg>;
const BookingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// --- Reusable NavItem that handles routing and active state ---
const NavItem = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-[#E6F3F0] text-[#006A57] font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};


// --- The Main Sidebar Component ---
export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="bg-white w-64 min-h-screen p-4 flex-col justify-between hidden lg:flex border-r border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 p-4">MindEase</h1>
        <nav className="mt-8 space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase px-4 mb-2">Main</p>
          <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
          <NavItem to="/chatbot" icon={<ChatIcon />}>Chatbot</NavItem>
          <NavItem to="/resources" icon={<ResourcesIcon />}>Resources</NavItem>
          <NavItem to="/forum" icon={<ForumIcon />}>Forum</NavItem>
          <NavItem to="/booking" icon={<BookingIcon />}>Booking</NavItem>
        </nav>
      </div>
      {/* This card only shows on the dashboard page */}
      {location.pathname === "/dashboard" && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200/80">
          <h3 className="font-bold text-gray-800">Daily Check-in</h3>
          <p className="text-sm text-gray-600 mt-1">Reflect in 2 minutes. Track mood and habits.</p>
          <Link to="/wellness-checkin" className="bg-white border border-gray-300/90 text-sm font-semibold mt-4 px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition-colors block text-center">
            Start now
          </Link>
        </div>
      )}
    </aside>
  );
}
