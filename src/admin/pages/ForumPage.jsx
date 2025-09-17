import React, { Fragment, useState, useMemo } from "react";
import { Card, PageHeader } from "../components/Shared";
import { motion } from "framer-motion";
import { MessageSquare, Users, Calendar, ChevronDown, ChevronUp, Edit3, Trash2, MoreVertical } from "lucide-react";

const mockForumTopics = [
  { id: 1, title: "How do you manage stress before presentations?", author: "Aarav Sharma", replies: 12, lastReply: "2025-09-10", status: "Open" },
  { id: 2, title: "Best tips to find a study-life balance?", author: "Saanvi Patel", replies: 8, lastReply: "2025-09-09", status: "Open" },
  { id: 3, title: "Effective group study techniques?", author: "Rahul Kumar", replies: 15, lastReply: "2025-09-11", status: "Closed" },
  { id: 4, title: "Preparing for final exams - resources?", author: "Priya Singh", replies: 23, lastReply: "2025-09-12", status: "Open" },
];

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
        <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
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

export default function ForumPage() {
  const [topics, setTopics] = useState(mockForumTopics);
  const [expandedRow, setExpandedRow] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  const stats = useMemo(() => {
    const totalTopics = topics.length;
    const totalReplies = topics.reduce((sum, t) => sum + t.replies, 0);
    return { totalTopics, totalReplies };
  }, [topics]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleMobileMenu = (id, e) => {
    e.stopPropagation();
    setMobileMenuOpen(mobileMenuOpen === id ? null : id);
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        <PageHeader title="Forum Management" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Users} title="Total Topics" value={stats.totalTopics} delay={0.2} />
        <StatCard icon={MessageSquare} title="Total Replies" value={stats.totalReplies} delay={0.4} />
      </div>

      {/* Forum Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 bg-white/70 backdrop-blur-md">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-40" />

          <div className="relative z-10">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 sm:py-3">Topic</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-3">Author</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-3">Replies</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-3">Last Reply</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-3">Status</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic, i) => (
                    <Fragment key={topic.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * i }}
                        onClick={() => setExpandedRow(expandedRow === topic.id ? null : topic.id)}
                        className="bg-white border-b hover:bg-gray-50 cursor-pointer transition-shadow hover:shadow-md"
                      >
                        <td className="px-4 py-4 sm:px-6 font-medium text-gray-900 max-w-xs truncate">{topic.title}</td>
                        <td className="px-4 py-4 sm:px-6 text-gray-600">{topic.author}</td>
                        <td className="px-4 py-4 sm:px-6">{topic.replies}</td>
                        <td className="px-4 py-4 sm:px-6">{formatDate(topic.lastReply)}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${topic.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {topic.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6 text-right space-x-2">
                          <button className="font-medium text-blue-600 hover:underline">Edit</button>
                          <button
                            onClick={e => { e.stopPropagation(); setTopics(prev => prev.filter(t => t.id !== topic.id)); }}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>

                      {expandedRow === topic.id && (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                          <td colSpan="6" className="p-4 bg-gray-50">
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-gray-700">Discussion Preview</h4>
                              <p className="text-sm text-gray-600">
                                This is a preview of the discussion for <span className="font-semibold">{topic.title}</span>.
                              </p>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </Fragment>
                  ))}
                  {topics.length === 0 && (
                    <tr><td className="px-6 py-6 text-gray-500" colSpan={6}>No topics found. Start adding discussions!</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === topic.id ? null : topic.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 pr-6">{topic.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{topic.author}</span>
                          <span className="mx-2">•</span>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{topic.replies} replies</span>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        onClick={(e) => toggleMobileMenu(topic.id, e)}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${topic.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {topic.status}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(topic.lastReply)}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Menu */}
                  {mobileMenuOpen === topic.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end space-x-3"
                    >
                      <button className="text-blue-600 flex items-center text-sm">
                        <Edit3 className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        className="text-red-600 flex items-center text-sm"
                        onClick={() => setTopics(prev => prev.filter(t => t.id !== topic.id))}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </motion.div>
                  )}

                  {/* Expanded Content */}
                  {expandedRow === topic.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-gray-50 p-4 border-t border-gray-200"
                    >
                      <h4 className="font-semibold text-gray-700 text-sm mb-2">Discussion Preview</h4>
                      <p className="text-xs text-gray-600">
                        This is a preview of the discussion for <span className="font-semibold">{topic.title}</span>.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {topics.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                  No topics found. Start adding discussions!
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}