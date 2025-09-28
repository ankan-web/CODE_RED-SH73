import React, { Fragment, useState, useMemo, useEffect } from "react";
import { Card, PageHeader } from "../components/Shared.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Edit, Trash2 } from "lucide-react";
import { db } from "../../firebase.js";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, where, getDocs } from "firebase/firestore";

const StatCard = ({ icon: Icon, title, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.04] group"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/40 via-cyan-400/30 to-purple-400/40 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition" />
    <div className="relative flex items-center space-x-4 sm:space-x-5">
      <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-2 sm:p-3 rounded-full shadow-md group-hover:scale-110 transition">
        <Icon className="h-5 w-5 sm:h-7 sm-w-7" />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent mt-1">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const EditPostModal = ({ post, onClose, onSave }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(post.id, {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">Edit Forum Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows="4" className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const DiscussionPreview = ({ postId }) => {
  const [comments, setComments] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  return (
    <div className="p-4 space-y-3 bg-slate-50">
      <h4 className="font-semibold text-gray-700">Discussion Preview</h4>
      {comments.length > 0 ? comments.map((c) => (
        <div key={c.id} className="text-sm text-gray-600 border-l-2 border-teal-200 pl-3">
          <p className="font-semibold text-gray-800">{c.authorName}</p>
          <p>{c.text}</p>
        </div>
      )) : <p className="text-sm text-gray-500">No comments yet on this post.</p>}
    </div>
  )
}

export default function ForumPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const topicsData = await Promise.all(querySnapshot.docs.map(async (postDoc) => {
        const postData = { id: postDoc.id, ...postDoc.data() };
        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postDoc.id));
        const commentsSnapshot = await getDocs(commentsQuery);
        postData.replies = commentsSnapshot.size;
        return postData;
      }));
      setTopics(topicsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const totalTopics = topics.length;
    const totalReplies = topics.reduce((sum, t) => sum + (t.replies || 0), 0);
    return { totalTopics, totalReplies };
  }, [topics]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post and all its comments? This cannot be undone.")) {
      try {
        // This is a simplified approach for cascading deletes. 
        // For production apps, a Cloud Function is the recommended way.
        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        const deletePromises = commentsSnapshot.docs.map(commentDoc => deleteDoc(commentDoc.ref));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, "posts", postId));
      } catch (error) {
        console.error("Error deleting post: ", error);
        alert("Failed to delete post.");
      }
    }
  };

  const handleSaveEdit = async (postId, updatedData) => {
    try {
      await updateDoc(doc(db, "posts", postId), updatedData);
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post: ", error);
      alert("Failed to update post.");
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      <AnimatePresence>
        {editingPost && <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSaveEdit} />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        <PageHeader title="Forum Management" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Users} title="Total Topics" value={stats.totalTopics} delay={0.2} />
        <StatCard icon={MessageSquare} title="Total Replies" value={stats.totalReplies} delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl p-0 bg-white/70 backdrop-blur-md">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-40" />
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3">Topic</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Replies</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Upvotes</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10">Loading topics...</td></tr>
                ) : topics.map((topic, i) => (
                  <Fragment key={topic.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => setExpandedRow(expandedRow === topic.id ? null : topic.id)}
                      className="bg-white/80 border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{topic.title}</td>
                      <td className="px-6 py-4 text-gray-600">{topic.authorName}</td>
                      <td className="px-6 py-4">{topic.replies}</td>
                      <td className="px-6 py-4">{formatDate(topic.createdAt)}</td>
                      <td className="px-6 py-4">{topic.upvotes || 0}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditingPost(topic); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(topic.id); }} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                      </td>
                    </motion.tr>

                    {expandedRow === topic.id && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50">
                        <td colSpan="6">
                          <DiscussionPreview postId={topic.id} />
                        </td>
                      </motion.tr>
                    )}
                  </Fragment>
                ))}
                {!loading && topics.length === 0 && (
                  <tr><td className="px-6 py-10 text-center text-gray-500" colSpan={6}>No topics found in the forum yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

