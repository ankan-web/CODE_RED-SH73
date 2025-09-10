import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// --- Mock User Data (This would come from your auth context or API) ---
const currentUser = {
  name: 'Maya',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format=fit=crop'
};

// --- SVG Icons ---
const PaperPlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const AttachmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SuggestionCard = ({ title, description }) => (
  <div className="bg-white/70 hover:bg-white border border-gray-200/80 rounded-xl p-4 cursor-pointer transition-all duration-300 group w-full max-w-xs text-center">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

// --- Main Components ---
const ChatSidebar = ({ isOpen, toggleSidebar }) => (
  <aside
    className={`bg-white w-80 min-h-screen p-4 flex flex-col justify-between border-r border-gray-100 transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
  >
    {/* Sidebar Header with Menu Icon */}
    <div className="flex justify-between items-center mb-4">
      <p className="text-xs text-gray-400 font-semibold uppercase">Past Chats</p>
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
      >
        <MenuIcon />
      </button>
    </div>

    <nav className="space-y-2">
      <a href="#" className="block px-4 py-3 rounded-lg bg-[#E6F3F0]">
        <h3 className="font-semibold text-gray-800">Exam Stress</h3>
        <p className="text-sm text-gray-500">Today, 10:12</p>
      </a>
      <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
        <h3 className="font-semibold text-gray-800">Sleep Routine</h3>
        <p className="text-sm text-gray-500">Yesterday</p>
      </a>
      <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
        <h3 className="font-semibold text-gray-800">Social Anxiety Tips</h3>
        <p className="text-sm text-gray-500">Mon</p>
      </a>
    </nav>
  </aside>
);


const ChatHeader = ({ user, toggleSidebar }) => (
  <header className="flex items-center justify-between p-4 bg-[#F0FAFA] sticky top-0 z-10 border-b border-gray-200/80">
    <div className="flex items-center space-x-3">
      {/* Menu Icon to open ChatSidebar */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition-colors"
      >
        <MenuIcon />
      </button>
      <div>
        <h2 className="text-lg font-bold text-gray-800">CareBot Chat</h2>
        <div className="flex items-center space-x-2 mt-1">
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          <p className="text-sm text-gray-600">Calm, confidential support</p>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <p className='text-sm text-gray-400 italic hidden sm:block'>Pastel bubbles, Conversational layout.</p>
      <img
        src={user.profileImageUrl}
        alt="User avatar"
        className="w-10 h-10 rounded-full"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/000000/FFFFFF?text=${user.name.charAt(0)}`; }}
      />
    </div>
  </header>
);

const ChatInput = () => (
  <div className="p-4 bg-[#F0FAFA] border-t border-gray-200/80">
    <div className="relative">
      <input
        type="text"
        placeholder="Type your message..."
        className="w-full bg-white rounded-lg pl-4 pr-32 py-3 border border-gray-300/90 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
        <button className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <AttachmentIcon />
        </button>
        <button className="bg-[#2D9A83] text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
          <span>Send</span>
          <PaperPlaneIcon />
        </button>
      </div>
    </div>
  </div>
);

// --- Chat Page ---
export default function ChatPage({ user = currentUser }) {
  const [isChatSidebarOpen, setChatSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#F0FAFA] min-h-screen font-sans">
      {/* Main Sidebar stays fixed */}
      <Sidebar />

      {/* Chat Sidebar with toggle */}
      <ChatSidebar
        isOpen={isChatSidebarOpen}
        toggleSidebar={() => setChatSidebarOpen(!isChatSidebarOpen)}
      />

      <main className="flex-1 flex flex-col">
        <ChatHeader
          user={user}
          toggleSidebar={() => setChatSidebarOpen(!isChatSidebarOpen)}
        />

        {/* Empty Chat State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">MindEase</h1>
            <p className="text-gray-600 mt-2">How can I help you today?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-3xl">
            <SuggestionCard title="I'm feeling anxious" description="Get tips to manage anxiety." />
            <SuggestionCard title="Trouble sleeping" description="Explore ways to improve sleep." />
            <SuggestionCard title="Stressed about exams" description="Find strategies to cope with stress." />
            <SuggestionCard title="Just want to talk" description="Start an open conversation." />
          </div>
        </div>

        <ChatInput />
      </main>
    </div>
  );
}
