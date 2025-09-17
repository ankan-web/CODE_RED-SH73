import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, PageHeader } from "../components/Shared";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, UserX, Edit, Search, Filter, MoreVertical, Mail, Phone, Calendar, Shield, ChevronDown, ChevronUp, MessageSquare, Settings } from "lucide-react";

// --- Stat Card ---
const StatCard = ({ icon: Icon, title, value, delay, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 
               shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 
               transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.04] group"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/40 via-cyan-400/30 to-purple-400/40 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition" />
    <div className="relative flex items-center space-x-4 sm:space-x-5">
      <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-2 sm:p-3 rounded-full shadow-md group-hover:scale-110 transition">
        <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
      </div>
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent mt-1">
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

// --- User Card Component ---
const UserCard = ({ user, onStatusChange, onEdit, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800"
  };

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    moderator: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800"
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Unknown") return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="relative bg-white/80 backdrop-blur-md rounded-2xl p-5 mb-4 shadow-lg 
                 border border-white/50 hover:shadow-xl transition-all duration-300 
                 hover:border-teal-200/50 group/user-card"
    >
      {/* Gradient border effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/20 via-cyan-400/10 to-purple-400/20 rounded-2xl blur-sm opacity-50 group-hover/user-card:opacity-70 transition" />

      <div className="relative z-10">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${statusColors[user.status]}`}></div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">{user.displayName}</h3>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                  {user.role}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Floating actions button */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-teal-100 hover:text-teal-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg p-2 z-20 min-w-[120px] border border-gray-200">
                <button
                  onClick={() => onEdit(user)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </button>
                <button
                  onClick={() => onStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Less' : 'More'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{user.email}</span>
                  {user.emailVerified && (
                    <Shield className="h-3 w-3 ml-2 text-green-500" title="Email Verified" />
                  )}
                </div>

                {user.phone !== "Not provided" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Joined: {formatDate(user.createdAt)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Last login: {formatDate(user.lastLogin)}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex items-center px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-200 transition">
                  <MessageSquare className="h-3 w-3 mr-1" /> Message
                </button>
                <select
                  value={user.status}
                  onChange={(e) => onStatusChange(user.id, e.target.value)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          displayName:
            data.displayName || data.name || data.email?.split("@")[0] || "No Name",
          email: data.email || "No Email",
          phone: data.phoneNumber || data.phone || "Not provided",
          photoURL:
            data.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.displayName || data.name || "U"
            )}&background=14b8a6&color=fff`,
          status: (data.status || (data.isActive !== false ? "active" : "inactive")).toString(),
          role: data.role || "user",
          lastLogin: data.lastLogin || data.metadata?.lastSignInTime || "Unknown",
          createdAt: data.createdAt || data.metadata?.creationTime || "Unknown",
          emailVerified: data.emailVerified || false
        };
      });
      setUsers(list);
      setFilteredUsers(list);
    } catch (e) {
      console.error("Failed to fetch users from Firestore:", e);
      setError("Failed to fetch users. Check Firestore permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  useEffect(() => {
    let result = users.filter(user => {
      const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, statusFilter, roleFilter]);

  // --- Stats Computation ---
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status.toLowerCase() === "active").length;
    const inactive = total - active;
    const admins = users.filter((u) => u.role === "admin").length;
    const moderators = users.filter((u) => u.role === "moderator").length;

    return { total, active, inactive, admins, moderators };
  }, [users]);

  const updateUserStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
    }
  };

  const handleEditUser = (user) => {
    // Implement edit functionality
    console.log("Edit user:", user);
    alert(`Edit functionality would open for: ${user.displayName}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6 sm:mb-8"
      >
        <PageHeader title="🧑‍💻 User Management" />
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2">
          <StatCard icon={Users} title="Total Users" value={stats.total} delay={0.2} />
        </div>
        <StatCard icon={UserCheck} title="Active" value={stats.active} delay={0.3} />
        <StatCard icon={UserX} title="Inactive" value={stats.inactive} delay={0.4} />
        <StatCard icon={Shield} title="Admins" value={stats.admins} delay={0.5} />
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Cards Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
      >
        <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 bg-white/70 backdrop-blur-md">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-40" />

          {loading && (
            <div className="text-center text-slate-500 py-16">Loading users…</div>
          )}
          {error && (
            <div className="text-center text-red-600 py-16">{error}</div>
          )}
          {!loading && !error && (
            <div className="relative z-10">
              {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      index={index}
                      onStatusChange={updateUserStatus}
                      onEdit={handleEditUser}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No users found matching your criteria</div>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setRoleFilter("all");
                    }}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}