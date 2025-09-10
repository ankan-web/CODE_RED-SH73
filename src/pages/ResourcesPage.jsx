import React, { useState } from 'react';
import DashboardPage from './DashboardPage';// Assuming you have the reusable sidebar
import Sidebar from '../components/Sidebar';

// --- Mock User Data & Resource Data ---
const currentUser = {
  name: 'User',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format=fit=crop'
};

const resourceData = {
  type: 'PDF',
  title: 'Breathing Techniques for Exam Stress',
  details: {
    Category: 'Exams, Stress',
    Author: 'MindEase Team',
    Updated: 'Aug 12, 2025',
    Pages: 6
  },
  summary: 'Evidence-based breathing patterns to reduce acute exam stress and improve focus within minutes.',
  related: [
    { title: 'Mindfulness Basics in 5 Minutes', type: 'Video' },
    { title: 'Managing Procrastination', type: 'Article' },
    { title: 'Grounding Exercises', type: 'PDF' },
  ]
};

// --- SVG Icons ---
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

// --- Reusable Components for this Page ---
const Header = ({ user }) => (
  <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-10 border-b border-gray-200/80">
    <h2 className="text-xl font-bold text-gray-800">Resource Detail</h2>
    <div className="flex items-center space-x-4">
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"><MoonIcon /></button>
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"><BellIcon /></button>
      <img src={user.profileImageUrl} alt="User avatar" className="w-10 h-10 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/000000/FFFFFF?text=${user.name.charAt(0)}`; }} />
    </div>
  </header>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-[#E6F3F0]/60 p-4 rounded-xl border border-gray-200/50">
    <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
    {children}
  </div>
);

const ActionModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
      <p className="mb-4">{message}</p>
      <button onClick={onClose} className="bg-[#2D9A83] text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors">
        OK
      </button>
    </div>
  </div>
);

// --- The Main Resource Detail Page Component ---
export default function ResourceDetailPage({ user = currentUser }) {
  const [modalMessage, setModalMessage] = useState('');

  const handleActionClick = (message) => {
    setModalMessage(message);
  };

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar/>
      <main className="flex-1">
        <Header user={user} />
        <div className="p-6">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-gray-500 mb-4">
            <a href="#" className="hover:underline">Back to Library</a>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-700">{resourceData.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200/70">
              {/* Resource Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center mb-4 sm:mb-0">
                  <PdfIcon />
                  <h1 className="text-xl font-bold text-gray-800 ml-3">{resourceData.title}</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleActionClick('Sharing options would appear here.')} className="bg-white border border-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">Share</button>
                  <button onClick={() => handleActionClick('This resource has been saved to your library.')} className="bg-white border border-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">Save</button>
                  <button onClick={() => handleActionClick('Your download will begin shortly.')} className="bg-[#2D9A83] text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">Download</button>
                </div>
              </div>
              {/* PDF Preview Area */}
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg mt-6">
                <p className="text-gray-400">Embedded PDF Preview</p>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              <InfoCard title="Details">
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(resourceData.details).map(([key, value]) => (
                    <p key={key}><strong className="font-medium text-gray-700">{key}:</strong> {value}</p>
                  ))}
                </div>
              </InfoCard>
              <InfoCard title="Summary">
                <p className="text-sm text-gray-600">{resourceData.summary}</p>
              </InfoCard>
              <InfoCard title="Related Resources">
                <div className="space-y-2">
                  {resourceData.related.map((item, index) => (
                    <a key={index} href="#" className="block bg-white/70 hover:bg-white p-3 rounded-lg border border-gray-200/80 transition-colors">
                      <p className="font-semibold text-sm text-gray-800">{item.title} <span className="text-gray-500 font-normal">({item.type})</span></p>
                    </a>
                  ))}
                </div>
              </InfoCard>
            </div>
          </div>
        </div>
      </main>
      {modalMessage && <ActionModal message={modalMessage} onClose={() => setModalMessage('')} />}
    </div>
  );
}

