import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { auth, db } from '../firebase.js';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, runTransaction, doc, where, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useLocation, Link } from 'react-router-dom';

// --- ANONYMITY HELPERS ---
const animals = [
  "Panda", "Tiger", "Lion", "Bear", "Wolf", "Fox", "Eagle", "Shark", "Owl", "Hawk",
  "Badger", "Cobra", "Falcon", "Gorilla", "Jaguar", "Leopard", "Panther", "Python"
];
const generateAnonymousUser = () => `Anonymous ${animals[Math.floor(Math.random() * animals.length)]}`;
const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${name.charAt(0)}&background=E6F3F0&color=006A57&bold=true`;


// --- SVG Icons ---
const UpvoteIcon = ({ hasVoted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${hasVoted ? 'text-teal-500' : ''}`} fill={hasVoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


// --- Reusable Components ---
const Header = ({ onNewPostClick }) => (
  <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-20 border-b border-gray-200/80">
    <h2 className="text-xl font-bold text-gray-800">Community Forum</h2>
    <button onClick={onNewPostClick} className="bg-[#2D9A83] text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">New Post</button>
  </header>
);

const Comment = ({ comment, user, onDelete }) => (
  <div className="flex items-start space-x-3">
    <img src={getAvatarUrl(comment.authorName)} alt="avatar" className="w-8 h-8 rounded-full" />
    <div className="bg-gray-100 p-3 rounded-lg flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm text-gray-800">{comment.authorName}</span>
          <span className="text-xs text-gray-400">• {comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleString() : 'Just now'}</span>
        </div>
        {user?.uid === comment.authorId && (
          <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500">
            <TrashIcon />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
    </div>
  </div>
);

const PostCard = ({ post, user, onToggle, isActive, onUpvote, onCommentSubmit, onDeletePost }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (isActive) {
      const q = query(collection(db, "comments"), where("postId", "==", post.id), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [isActive, post.id]);

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onCommentSubmit(post.id, commentText);
      setCommentText('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteDoc(doc(db, "comments", commentId));
    }
  }

  return (
    <div className={`bg-white rounded-2xl border ${isActive ? 'border-teal-500 shadow-lg' : 'border-gray-200/70 hover:border-gray-300 transition-shadow'}`}>
      <div onClick={onToggle} className="p-4 cursor-pointer">
        <div className="flex space-x-4">
          <div className="flex flex-col items-center space-y-1 text-gray-500">
            <button onClick={(e) => { e.stopPropagation(); onUpvote(post.id); }} className="p-1 rounded-full hover:bg-gray-100">
              <UpvoteIcon hasVoted={post.userHasVoted} />
            </button>
            <span className="font-semibold text-sm text-gray-800">{post.upvotes || 0}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{post.title}</h3>
            <div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center space-x-2">
                <img src={getAvatarUrl(post.authorName)} alt="avatar" className="w-5 h-5 rounded-full" />
                <span>by {post.authorName}</span>
              </div>
              <span>•</span>
              <span>{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>)}
              </div>
            )}
            <p className="text-gray-600 mt-2 text-sm">{post.content}</p>
          </div>
          {user?.uid === post.authorId && (
            <button onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); }} className="text-gray-400 hover:text-red-500 h-fit">
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
      {isActive && (
        <div onClick={(e) => e.stopPropagation()} className="px-4 pb-4 pt-4 border-t border-gray-200/80">
          <div className="space-y-4 mb-4">
            {comments.map((comment) => <Comment key={comment.id} comment={comment} user={user} onDelete={handleDeleteComment} />)}
          </div>
          <form onSubmit={handleComment} className="flex items-start space-x-3">
            <img src={getAvatarUrl("You")} alt="your avatar" className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a supportive comment..." className="w-full bg-gray-50 rounded-lg p-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" rows="2"></textarea>
              <div className="flex justify-end mt-2">
                <button type="submit" className="bg-[#2D9A83] text-white font-semibold py-1 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">Post</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const RightSidebar = ({ activeFilter, setActiveFilter, onNewPostClick }) => {
  const filters = ['All', 'Exams', 'Lifestyle', 'Stress', 'Habits', 'Academics', 'Social', 'Motivation', 'Homesickness'];
  return (
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
};

const NewPostModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
    // Reset fields and close
    setTitle(''); setContent(''); setTags('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create an Anonymous Post</h2>
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
            <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md">Post Anonymously</button>
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
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Don't fetch posts until user is known
    setLoading(true);
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(postsQuery, async (querySnapshot) => {
      const postsData = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
        const post = { id: docSnapshot.id, ...docSnapshot.data() };
        const voteRef = doc(collection(db, 'posts', post.id, 'votes'), user.uid);
        const voteSnap = await getDocs(query(collection(db, 'posts', post.id, 'votes'), where('__name__', '==', user.uid)));
        post.userHasVoted = !voteSnap.empty;
        return post;
      }));

      setForumPosts(postsData);
      if (postsData.length > 0 && !expandedPostId) {
        setExpandedPostId(postsData[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, expandedPostId]);


  const handleAddPost = async (newPost) => {
    if (!user) { alert("You must be logged in to post."); return; }
    const postData = {
      ...newPost,
      authorId: user.uid,
      authorName: generateAnonymousUser(),
      createdAt: serverTimestamp(),
      upvotes: 0,
    };
    const docRef = await addDoc(collection(db, "posts"), postData);
    setExpandedPostId(docRef.id);
  };

  const handleCommentSubmit = async (postId, commentText) => {
    if (!user) { alert("You must be logged in to comment."); return; }
    await addDoc(collection(db, "comments"), {
      postId,
      text: commentText,
      authorId: user.uid,
      authorName: generateAnonymousUser(),
      createdAt: serverTimestamp(),
    });
  };

  const handleUpvote = async (postId) => {
    if (!user) { alert("You must be logged in to vote."); return; }
    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(collection(postRef, 'votes'), user.uid);

    await runTransaction(db, async (transaction) => {
      const voteDoc = await transaction.get(voteRef);
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) throw "Post does not exist!";

      const currentUpvotes = postDoc.data().upvotes || 0;
      if (voteDoc.exists()) {
        transaction.update(postRef, { upvotes: currentUpvotes - 1 });
        transaction.delete(voteRef);
      } else {
        transaction.update(postRef, { upvotes: currentUpvotes + 1 });
        transaction.set(voteRef, { votedAt: serverTimestamp() });
      }
    });
  };

  const handleDeletePost = async (postId) => {
    const postToDelete = forumPosts.find(p => p.id === postId);
    if (postToDelete.authorId !== user.uid) {
      alert("You can only delete your own posts.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this post?")) {
      // Simplified cascade delete, for production consider a cloud function
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach(commentDoc => deleteDoc(commentDoc.ref));
      await deleteDoc(doc(db, "posts", postId));
    }
  }

  const filteredPosts = activeFilter === 'All'
    ? forumPosts
    : forumPosts.filter(post => post.tags && post.tags.includes(activeFilter));

  const togglePost = (id) => setExpandedPostId(expandedPostId === id ? null : id);

  if (loading || !user) {
    return (
      <div className="flex bg-[#F7FCFB] min-h-screen font-sans justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header onNewPostClick={() => setIsModalOpen(true)} />
        <div className="flex-1 flex justify-between">
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                <input type="text" placeholder="Search discussions" className="w-full bg-white rounded-lg pl-10 pr-4 py-2 border border-gray-200/80 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} user={user} onToggle={() => togglePost(post.id)} isActive={expandedPostId === post.id} onUpvote={handleUpvote} onCommentSubmit={handleCommentSubmit} onDeletePost={handleDeletePost} />
                ))
              ) : (
                !loading && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/70">
                    <h3 className="text-lg font-semibold text-gray-700">No Discussions Yet</h3>
                    <p className="text-gray-500 mt-2">Be the first to start a conversation by creating a new post!</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-[#2D9A83] text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">
                      Create Post
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
          <RightSidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} onNewPostClick={() => setIsModalOpen(true)} />
        </div>
      </main>
      <NewPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddPost} />
    </div>
  );
}

