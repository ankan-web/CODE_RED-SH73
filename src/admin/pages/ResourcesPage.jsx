import React, { useEffect, useMemo, useState } from "react";
import { Card, PageHeader } from "../components/Shared";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash, FileText, Video, BookOpen, ExternalLink, Settings, Edit, Link as LinkIcon } from "lucide-react";
import { summarizeResource } from "../../services/aiService"; // Adjust path if needed

// --- Resource Modal (no changes) ---
function ResourceModal({ initial, onClose, onSave }) {
  // ... (This component remains the same as your original code)
  const [title, setTitle] = useState(initial?.title || "");
  const [links, setLinks] = useState(initial?.links || [{ title: "", url: "", type: "Article" }]);

  const updateLink = (idx, field, value) => {
    const next = links.slice();
    next[idx] = { ...next[idx], [field]: value };
    setLinks(next);
  };
  const addLinkRow = () => setLinks(prev => [...prev, { title: "", url: "", type: "Article" }]);
  const removeLinkRow = idx => setLinks(prev => prev.filter((_, i) => i !== idx));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
      >
        <h3 className="text-lg font-bold mb-4">{initial?.id ? "Edit Resource Topic" : "Add New Resource Topic"}</h3>
        <form onSubmit={e => { e.preventDefault(); onSave({ id: initial?.id, title, links }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base"
              required
            />
          </div>
          <hr />
          {links.map((link, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-md relative hover:shadow-md transition">
              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLinkRow(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                >
                  &times;
                </button>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Link Title</label>
                <input
                  value={link.title}
                  onChange={e => updateLink(index, "title", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  value={link.url}
                  onChange={e => updateLink(index, "url", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={link.type}
                  onChange={e => updateLink(index, "type", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option>Article</option>
                  <option>Video</option>
                  <option>Guide</option>
                  <option>PDF</option>
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLinkRow}
            className="text-sm bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 w-full flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Another Link
          </button>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 text-sm sm:text-base"
            >
              Save Topic
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- Stat Card (no changes) ---
const StatCard = ({ icon: Icon, title, value, delay }) => (
  // ... (This component remains the same as your original code)
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.04] group"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/40 via-cyan-400/30 to-purple-400/40 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition" />
    <div className="relative flex items-center space-x-4 sm:space-x-5">
      <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-2 sm:p-3 rounded-full shadow-md group-hover:scale-110 transition">
        <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

// --- UPDATED Resource Card Component ---
const ResourceCard = ({ resource, onEdit, onDelete, onSummarize, summary, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const iconMap = { Article: FileText, Video: Video, Guide: BookOpen, PDF: FileText };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="relative bg-white/80 backdrop-blur-md rounded-2xl p-5 mb-4 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:border-teal-200/50 group/resource-card"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/20 via-cyan-400/10 to-purple-400/20 rounded-2xl blur-sm opacity-50 group-hover/resource-card:opacity-70 transition" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-teal-100/70 p-3 rounded-full border border-white">
              <BookOpen className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{resource.title}</h3>
              <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                <LinkIcon className="h-3 w-3" />
                <span>{resource.links?.length || 0} Links</span>
                <span className="text-gray-300">•</span>
                <span>Added: {formatDate(resource.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg p-2 z-20 min-w-[120px] border border-gray-200">
                <button onClick={() => { onSummarize(resource); setShowActions(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Summarize
                </button>
                <button onClick={() => { onEdit(resource); setShowActions(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </button>
                <button onClick={() => { onDelete(resource.id); setShowActions(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center">
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {summary && (
          <div className="mt-4 p-3 bg-teal-50/50 rounded-lg border border-teal-200/50 text-sm">
            {summary.loading ? (
              <p className="text-gray-500 animate-pulse">Generating summary...</p>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{summary.text}</p>
            )}
          </div>
        )}

        <div className="mt-4">
          <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-teal-600 hover:text-teal-800">
            {expanded ? 'Hide Links' : 'Show Links'}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <ul className="space-y-3">
                {(resource.links || []).map((link, idx) => {
                  const Icon = iconMap[link.type] || FileText;
                  return (
                    <li key={idx}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-2 bg-slate-50/50 rounded-lg border border-gray-200/50 hover:shadow-sm hover:bg-white transition">
                        <Icon className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-800">{link.title}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{link.type}</span>
                            <ExternalLink className="w-3 h-3" />
                          </p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const colRef = collection(db, "resources");
    const unsub = onSnapshot(colRef, snap => setResources(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const totalTopics = resources.length;
    const totalLinks = resources.reduce((sum, r) => sum + (r.links?.length || 0), 0);
    return { totalTopics, totalLinks };
  }, [resources]);

  const handleSave = async (data) => {
    if (data.id) {
      const { id, ...payload } = data;
      await updateDoc(doc(db, "resources", id), payload);
    } else {
      const { id, ...payload } = data;
      await addDoc(collection(db, "resources"), { ...payload, createdAt: serverTimestamp() });
    }
    setModalOpen(false);
    setEditingResource(null);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entire resource topic?")) return;
    await deleteDoc(doc(db, "resources", id));
  };

  const handleSummarize = async (resource) => {
    setSummaries(prev => ({ ...prev, [resource.id]: { loading: true } }));
    try {
      const summaryText = await summarizeResource(resource.title, resource.links);
      setSummaries(prev => ({
        ...prev,
        [resource.id]: { loading: false, text: summaryText }
      }));
    } catch (error) {
      console.error("Failed to summarize:", error);
      setSummaries(prev => ({
        ...prev,
        [resource.id]: { loading: false, text: "Could not generate summary." }
      }));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingResource(null);
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      <AnimatePresence>
        {modalOpen && <ResourceModal initial={editingResource} onClose={handleModalClose} onSave={handleSave} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        <PageHeader title="📚 Resource Hub" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={BookOpen} title="Total Topics" value={stats.totalTopics} delay={0.2} />
        <StatCard icon={LinkIcon} title="Total Links" value={stats.totalLinks} delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 bg-transparent border-none">
          <div className="relative z-10 space-y-4">
            {resources.length > 0 ? (
              resources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSummarize={handleSummarize}
                  summary={summaries[resource.id]}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/50 rounded-2xl">
                <div className="text-gray-500 mb-4">No resources found.</div>
                <p className="text-sm text-gray-400">Click the button below to add your first resource topic.</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center justify-center bg-teal-500 text-white font-semibold px-4 py-3 rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/30 space-x-2 transition-all text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" /> Add New Resource
        </motion.button>
      </div>
    </div>
  );
}