import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
// import { summarizeResource } from '../services/AIService';

// --- Mock User Data ---
const currentUser = {
  name: 'User',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format=fit=crop'
};

function useResources() {
  const [resources, setResources] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'resources'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResources(list);
    });
    return () => unsub();
  }, []);
  return resources;
}

// --- SVG Icons ---
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

// --- Reusable Components for this Page ---
const Header = ({ user }) => (
  <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-10 border-b border-gray-200/80">
    <h2 className="text-xl font-bold text-gray-800">Resources</h2>
    <div className="flex items-center space-x-4">
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"><MoonIcon /></button>
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"><BellIcon /></button>
      <img src={user.profileImageUrl} alt="User avatar" className="w-10 h-10 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/000000/FFFFFF?text=${user.name.charAt(0)}`; }} />
    </div>
  </header>
);

const ResourceCard = ({ resource, onClick }) => (
  <div
    onClick={onClick}
    className="bg-teal-50/60 rounded-xl border border-teal-200 shadow-sm p-6 transition-all cursor-pointer hover:bg-teal-50 hover:shadow-[0_8px_24px_rgba(20,184,166,0.25)] hover:border-teal-300"
  >
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{resource.title}</h3>
      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1 ml-2 flex-shrink-0">
        {resource.links?.length || 0} links
      </span>
    </div>
    <p className="text-sm text-teal-700 mb-3">
      Click to view resources and get AI summary
    </p>
    <div className="flex flex-wrap gap-1">
      {resource.links?.slice(0, 3).map((link, index) => (
        <span key={index} className="text-xs bg-white text-teal-700 border border-teal-200 rounded px-2 py-1">
          {link.type}
        </span>
      ))}
      {(resource.links?.length || 0) > 3 && (
        <span className="text-xs bg-white text-teal-700 border border-teal-200 rounded px-2 py-1">
          +{(resource.links?.length || 0) - 3} more
        </span>
      )}
    </div>
  </div>
);

const ResourceModal = ({ resource, onClose }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  

  if (!resource) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">{resource.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
            <div className="space-y-3">
              {(resource.links || []).map((link, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{link.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{link.url}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs bg-teal-100 text-teal-700 rounded px-2 py-1">
                        {link.type}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-500 text-white px-3 py-1 rounded text-sm hover:bg-teal-600 transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {summary ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No summary yet. Click "Summarize" to generate one.</p>
              )}
            </div>
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="mt-3 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- The Main Resource Detail Page Component ---
export default function ResourceDetailPage({ user = currentUser }) {
  const resources = useResources();
  const [selectedResource, setSelectedResource] = useState(null);

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1">
        <Header user={user} />
        <div className="p-6">
          {/* Resource Library Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resource Library</h2>
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No resources available</h3>
                <p className="text-gray-500">Resources will appear here when an admin adds them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => setSelectedResource(resource)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}