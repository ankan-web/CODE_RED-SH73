import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebase';

// --- MOCK DATA GENERATION ---
// Helper functions to create a more dynamic and populated forum experience.

const sampleTitles = [
  "How do you manage exam anxiety the night before?",
  "Best campus spots to decompress between lectures?",
  "Anyone tried 5-minute journaling? Any tips?",
  "Sharing my 3-step routine that calmed my exam panic",
  "Feeling overwhelmed with coursework, how do you prioritize?",
  "Tips for making friends in a new city?",
  "Best apps for guided meditation?",
  "How to maintain a healthy sleep schedule during finals?",
  "Struggling with motivation for online classes",
  "What are your favorite healthy and cheap meals?",
];

const sampleContent = [
  "I keep overthinking and can't fall asleep. Any routines or breathing exercises that worked for you?",
  "Looking for quiet corners or nature spots where you like to relax or meditate.",
  "Thinking about starting a quick nightly journal to reflect and unwind. How do you structure it?",
  "Last night I tried a short routine: 1) 4-7-8 breathing, 2) 5 mins of stretching, 3) writing tomorrow's tasks. Woke up less tense. Hope it helps!",
  "I have three major assignments due next week and I'm not sure where to even start. It's causing a lot of stress.",
  "Just moved here for college and I'm finding it hard to connect with people outside of class.",
  "I've heard good things about Headspace and Calm, but are there any free alternatives that are just as good?",
  "It feels impossible to get 8 hours of sleep when I have to pull all-nighters to study. Is it even worth trying?",
  "It's so easy to get distracted at home. How do you all stay focused and on track with your lectures?",
  "I'm trying to eat better but I'm on a tight student budget. Looking for some simple and affordable recipe ideas!",
];

const sampleTags = [['Exams', 'Stress'], ['Lifestyle'], ['Habits'], ['Exams', 'Self-care'], ['Academics', 'Stress'], ['Social'], ['Apps', 'Mindfulness'], ['Sleep', 'Academics'], ['Motivation'], ['Health', 'Lifestyle']];

// Generates a random anonymous user ID
const generateAnonymousUser = () => `Anonymous${Math.floor(1000 + Math.random() * 9000)}`;

// Generates a set of mock posts
const generateMockPosts = (count) => {
  const posts = [];
  for (let i = 0; i < count; i++) {
    const postIndex = i % sampleTitles.length;
    posts.push({
      id: i + 1,
      upvotes: Math.floor(Math.random() * 250),
      title: sampleTitles[postIndex],
      author: generateAnonymousUser(),
      authorImg: `https://placehold.co/40x40/E2E8F0/475569?text=${'A' + i}`,
      time: `${Math.floor(Math.random() * 10) + 1}h ago`,
      tags: sampleTags[postIndex],
      content: sampleContent[postIndex],
      comments: i === 0 ? [ // Add some default comments to the first post
        { author: generateAnonymousUser(), authorImg: 'https://placehold.co/40x40/DDBEA9/A5A58D?text=B', time: '1h ago', text: 'Love the sticky note idea. It stops me from ruminating. Thanks for sharing!' },
        { author: generateAnonymousUser(), authorImg: 'https://placehold.co/40x40/CB997E/FFE8D6?text=C', time: '35m ago', text: 'I pair 4-7-8 with box breathing (3 rounds). Helps during the day, too.' },
      ] : [],
      lastReply: `${Math.floor(Math.random() * 50) + 1}m ago`,
    });
  }
  return posts.sort((a, b) => b.upvotes - a.upvotes);
};


const filters = ['All', 'Exams', 'Lifestyle', 'Stress', 'Habits', 'Academics', 'Social', 'Motivation'];

// --- SVG Icons ---
const UpvoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// --- Reusable Components ---
const Header = ({ user, onNewPostClick }) => {
  // FIX: More robust logic to handle fallback for profile picture initial
  const pfpInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-20 border-b border-gray-200/80">
      <h2 className="text-xl font-bold text-gray-800">Community Forum</h2>
      <div className="flex items-center space-x-2">
        <button onClick={onNewPostClick} className="bg-[#2D9A83] text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">New Post</button>
        <img
          src={user?.photoURL || `https://placehold.co/40x40/E2E8F0/475569?text=${pfpInitial.toUpperCase()}`}
          alt="User avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  );
};


const PostCard = ({ post, onToggle, isActive, onCommentSubmit }) => {
  const [commentText, setCommentText] = useState('');

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onCommentSubmit(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div onClick={onToggle} className={`bg-white p-4 rounded-2xl cursor-pointer border ${isActive ? 'border-teal-500 shadow-md' : 'border-gray-200/70 hover:border-gray-300'}`}>
      <div className="flex space-x-4">
        <div className="flex flex-col items-center space-y-1 text-gray-500">
          <button className="p-1 rounded-full hover:bg-gray-100"><UpvoteIcon /></button>
          <span className="font-semibold text-sm text-gray-800">{post.upvotes}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{post.title}</h3>
          <div className="flex items-center flex-wrap gap-x-2 text-sm text-gray-500 mt-1">
            <img src={post.authorImg} className="w-5 h-5 rounded-full" />
            <span>by {post.author}</span>
            <span>•</span>
            <span>{post.time}</span>
            {post.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>)}
          </div>
          <p className="text-gray-600 mt-2 text-sm">{post.content}</p>
          <div className="flex items-center justify-end mt-3">
            <p className="text-xs text-gray-400">Last reply {post.lastReply}</p>
          </div>
        </div>
      </div>
      {isActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pl-12 mt-4 pt-4 border-t border-gray-200/80"
        >
          <form onSubmit={handleComment} className="flex items-start space-x-3">
            <img src={auth.currentUser?.photoURL || `https://placehold.co/40x40/006A57/E6F3F0?text=U`} className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a supportive comment..." className="w-full bg-gray-50 rounded-lg p-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" rows="2"></textarea>
              <div className="flex justify-end mt-2">
                <button type="submit" className="bg-[#2D9A83] text-white font-semibold py-1 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">Post</button>
              </div>
            </div>
          </form>
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
};

const RightSidebar = ({ activeFilter, setActiveFilter, onNewPostClick }) => (
  <aside className="w-80 p-6 space-y-6 hidden lg:block">
    <div className="bg-white p-4 rounded-2xl border border-gray-200/70">
      <h3 className="font-semibold text-gray-800">Create</h3>
      <p className="text-sm text-gray-500 mt-1">Start a new discussion</p>
      <button onClick={onNewPostClick} className="w-full mt-3 bg-[#2D9A83] text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">New Post</button>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-200/70">
      <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>
      <div className="space-y-2">
        {filters.map(filter => (<button key={filter} onClick={() => setActiveFilter(filter)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === filter ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>{filter}</button>))}
      </div>
    </div>
  </aside>
);

const NewPostModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      upvotes: 0,
      title,
      author: generateAnonymousUser(),
      authorImg: `https://placehold.co/40x40/E2E8F0/475569?text=A`,
      time: 'Just now',
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      content,
      comments: [],
      lastReply: 'Just now',
    };
    onSave(newPost);
    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="mt-1 w-full p-2 border rounded-md" rows="4" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Exams, Stress" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Forum Page Component ---
export default function ForumPage() {
  const [user, setUser] = useState(null);
  const [forumPosts, setForumPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState(1); // Default open first post
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch current user and wait for it
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser); // Will be null initially, then the user object
    });

    // Load initial posts
    setForumPosts(generateMockPosts(15));
    return () => unsubscribe();
  }, []);

  const handleAddPost = (newPost) => {
    setForumPosts(prevPosts => [newPost, ...prevPosts]);
    setExpandedPostId(newPost.id); // Open the new post
  };

  const handleCommentSubmit = (postId, commentText) => {
    const newComment = {
      author: generateAnonymousUser(),
      authorImg: user.photoURL || `https://placehold.co/40x40/006A57/E6F3F0?text=${user.displayName?.charAt(0) || 'U'}`,
      time: 'Just now',
      text: commentText,
    };
    setForumPosts(posts => posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment], lastReply: 'Just now' }
        : post
    ));
  };

  const filteredPosts = activeFilter === 'All'
    ? forumPosts
    : forumPosts.filter(post => post.tags.includes(activeFilter));

  const togglePost = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  // FIX: Show a loading state until the user object is available
  if (!user) {
    return (
      <div className="flex bg-[#F7FCFB] min-h-screen font-sans justify-center items-center">
        <div>Loading forum...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header user={user} onNewPostClick={() => setIsModalOpen(true)} />
        <div className="flex-1 flex justify-between">
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                <input type="text" placeholder="Search discussions" className="w-full bg-white rounded-lg pl-10 pr-4 py-2 border border-gray-200/80 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} onToggle={() => togglePost(post.id)} isActive={expandedPostId === post.id} onCommentSubmit={handleCommentSubmit} />
              ))}
            </div>
          </div>
          <RightSidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNewPostClick={() => setIsModalOpen(true)} />
        </div>
      </main>
      <NewPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddPost} />
    </div>
  );
}

