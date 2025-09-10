import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// --- Mock Data ---
const currentUser = {
  name: 'Maya',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format=fit=crop'
};

const forumPosts = [
  {
    id: 1,
    upvotes: 128,
    title: 'How do you manage exam anxiety the night before?',
    author: 'Mia',
    authorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format=fit=crop',
    time: '2h ago',
    tags: ['Exams', 'Stress'],
    content: "I keep overthinking and can't fall asleep. Any routines or breathing exercises that worked for you?",
    comments: [],
    lastReply: '12m ago',
  },
  {
    id: 2,
    upvotes: 76,
    title: 'Best campus spots to decompress between lectures?',
    author: 'Leo',
    authorImg: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format=fit=crop',
    time: '5h ago',
    tags: ['Lifestyle'],
    content: "Looking for quiet corners or nature spots where you like to relax or meditate.",
    comments: [],
    lastReply: '1h ago',
  },
  {
    id: 3,
    upvotes: 45,
    title: 'Anyone tried 5-minute journaling? Tips?',
    author: 'Priya',
    authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1887&auto=format=fit=crop',
    time: '1d ago',
    tags: ['Habits'],
    content: "Thinking about starting a quick nightly journal to reflect and unwind. How do you structure it?",
    comments: [],
    lastReply: '3h ago',
  },
  {
    id: 4,
    upvotes: 212,
    title: 'Sharing my 3-step routine that calmed my exam panic',
    author: 'Ahmad',
    authorImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format=fit=crop',
    time: '4h ago',
    tags: ['Exams', 'Self-care'],
    content: "Last night I tried a short routine: 1) 4-7-8 breathing for 3 cycles, 2) 5 minutes of light stretching, 3) writing tomorrow's top 3 tasks on a sticky note. Fell asleep faster and woke up less tense. Hope it helps someone. Open to suggestions to tweak it!",
    comments: [
      { author: 'Mia', authorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format=fit=crop', time: '1h ago', text: 'Love the sticky note idea. It stops me from ruminating. Thanks for sharing!' },
      { author: 'Leo', authorImg: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format=fit=crop', time: '35m ago', text: 'I pair 4-7-8 with box breathing (3 rounds). Helps during the day, too.' },
    ],
    lastReply: '35m ago',
  }
];

const filters = ['All', 'Exams', 'Lifestyle', 'Stress', 'Habits'];

// --- SVG Icons ---
const UpvoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// --- Reusable Components ---
const Header = ({ user }) => (
  <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-20 border-b border-gray-200/80">
    <h2 className="text-xl font-bold text-gray-800">Community Forum</h2>
    <div className="flex items-center space-x-2">
      <button className="bg-[#2D9A83] text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">New Post</button>
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"></button>
      <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"></button>
      <img src={user.profileImageUrl} alt="User avatar" className="w-10 h-10 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/000000/FFFFFF?text=${user.name.charAt(0)}`; }} />
    </div>
  </header>
);

const PostCard = ({ post, onToggle, isActive }) => (
  <div onClick={onToggle} className={`bg-white p-4 rounded-2xl cursor-pointer border ${isActive ? 'border-teal-500' : 'border-gray-200/70 hover:border-gray-300'}`}>
    <div className="flex space-x-4">
      <div className="flex flex-col items-center space-y-1 text-gray-500">
        <button className="p-1 rounded-full hover:bg-gray-100"><UpvoteIcon /></button>
        <span className="font-semibold text-sm text-gray-800">{post.upvotes}</span>
        <button className="p-1 rounded-full hover:bg-gray-100 transform rotate-180"><UpvoteIcon /></button>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800">{post.title}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <img src={post.authorImg} className="w-5 h-5 rounded-full" />
          <span>by {post.author}</span>
          <span>•</span>
          <span>{post.time}</span>
          {post.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>)}
        </div>
        <p className="text-gray-600 mt-2 text-sm">{post.content}</p>
        <div className="flex items-center justify-between mt-3">
          <button className="text-sm font-semibold text-gray-500 hover:text-gray-800">Save</button>
          <p className="text-xs text-gray-400">Last reply {post.lastReply}</p>
        </div>
      </div>
    </div>
    {isActive && (
      <div className="pl-12 mt-4 pt-4 border-t border-gray-200/80">
        <div className="flex items-start space-x-3">
          <img src={currentUser.profileImageUrl} className="w-8 h-8 rounded-full" />
          <div className="flex-1 relative">
            <textarea placeholder="Write a supportive comment..." className="w-full bg-gray-50 rounded-lg p-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" rows="2"></textarea>
            <button className="absolute bottom-2 right-2 bg-[#2D9A83] text-white font-semibold py-1 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">Post</button>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          {post.comments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-3">
              <img src={comment.authorImg} className="w-8 h-8 rounded-full" />
              <div className="bg-gray-100 p-3 rounded-lg flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                  <span className="text-xs text-gray-400">• {comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const RightSidebar = ({ activeFilter, setActiveFilter }) => (
  <aside className="w-80 p-6 space-y-6 hidden lg:block">
    <div className="bg-white p-4 rounded-2xl border border-gray-200/70">
      <h3 className="font-semibold text-gray-800">Create</h3>
      <p className="text-sm text-gray-500 mt-1">Start a new discussion</p>
      <button className="w-full mt-3 bg-[#2D9A83] text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">New Post</button>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-200/70">
      <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>
      <div className="space-y-2">
        {filters.map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === filter ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            {filter}
          </button>
        ))}
      </div>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-200/70">
      <h3 className="font-semibold text-gray-800">Community Guidelines</h3>
      <p className="text-sm text-gray-500 mt-2">Be supportive, avoid diagnoses, and use content warnings when needed.</p>
    </div>
  </aside>
);


// --- Main Forum Page Component ---
export default function ForumPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState(4); // Default to open the one with comments

  const filteredPosts = activeFilter === 'All'
    ? forumPosts
    : forumPosts.filter(post => post.tags.includes(activeFilter));

  const togglePost = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header user={currentUser} />
        <div className="flex-1 flex justify-between">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                <input type="text" placeholder="Search discussions" className="w-full bg-white rounded-lg pl-10 pr-4 py-2 border border-gray-200/80 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" />
              </div>
              <button className="bg-white border border-gray-200/80 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Sort</button>
            </div>
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} onToggle={() => togglePost(post.id)} isActive={expandedPostId === post.id} />
              ))}
            </div>
          </div>
          {/* Right Sidebar */}
          <RightSidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>
      </main>
      <a href="#top" className="fixed bottom-6 right-6 bg-[#2D9A83] h-12 w-12 flex items-center justify-center rounded-full shadow-lg text-white hover:bg-teal-700 transition-colors">
        <UpvoteIcon />
      </a>
    </div>
  );
}

