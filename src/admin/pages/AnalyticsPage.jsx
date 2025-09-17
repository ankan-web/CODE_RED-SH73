import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, PageHeader, ChartComponent } from "../components/Shared";
import { Users, TrendingUp, Wallet } from "lucide-react";
import { motion } from "framer-motion";

// --- Stunning Stat Card ---
const StatCard = ({ icon: Icon, title, value, isLoading, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 
               shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 
               transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.04] group"
  >
    {/* Gradient Glow Background */}
    <div className="absolute -inset-1 bg-gradient-to-r from-teal-300/40 via-cyan-400/30 to-purple-400/40 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition" />
    <div className="relative flex items-center space-x-4 sm:space-x-5">
      <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-2 sm:p-3 rounded-full shadow-md group-hover:scale-110 transition">
        <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent mt-1">
          {isLoading ? "…" : value}
        </p>
      </div>
    </div>
  </motion.div>
);

export default function AnalyticsPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [userSnap, bookingsSnap] = await Promise.all([
          getDocs(query(collection(db, "users"))),
          getDocs(collection(db, "bookings")),
        ]);

        const userList = userSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const bookingList = bookingsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setUsers(userList);
        setBookings(bookingList);
      } catch (e) {
        console.error("Error loading analytics data:", e);
        setError("Failed to load analytics. Check console for permission errors.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const analyticsData = useMemo(() => {
    const totalUsers = users.length;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const activeToday = users.filter((u) => {
      const ts = u.lastLogin?.toDate
        ? u.lastLogin.toDate()
        : u.lastLogin
          ? new Date(u.lastLogin)
          : null;
      return ts && ts >= startOfDay;
    }).length;

    const totalBookings = bookings.length;
    const revenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    const counts = new Array(12).fill(0);
    users.forEach((u) => {
      const created = u.createdAt?.toDate
        ? u.createdAt.toDate()
        : u.createdAt
          ? new Date(u.createdAt)
          : null;
      if (created && !Number.isNaN(created.getTime())) {
        counts[created.getMonth()] += 1;
      }
    });

    const monthLabels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const growthData = {
      labels: monthLabels,
      datasets: [
        {
          label: "Users",
          data: counts,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#06b6d4",
          pointBorderColor: "#fff",
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#06b6d4",
          pointRadius: 5,
          borderWidth: 2,
        },
      ],
    };

    return { totalUsers, activeToday, totalBookings, revenue, growthData };
  }, [users, bookings]);

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { 
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb", borderDash: [2, 4], drawBorder: false },
        ticks: { 
          color: "#64748b",
          maxTicksLimit: 5,
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        },
      },
      x: { 
        grid: { display: false }, 
        ticks: { 
          color: "#64748b",
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        } 
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6 sm:mb-8"
      >
        <PageHeader title="Analytics Dashboard" />
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
        <StatCard
          icon={Users}
          title="Total Users"
          value={analyticsData.totalUsers}
          isLoading={loading}
          delay={0.2}
        />
        <StatCard
          icon={TrendingUp}
          title="Active Today"
          value={analyticsData.activeToday}
          isLoading={loading}
          delay={0.4}
        />
        <StatCard
          icon={Wallet}
          title="Bookings & Revenue"
          value={`${analyticsData.totalBookings} • ₹${analyticsData.revenue.toLocaleString()}`}
          isLoading={loading}
          delay={0.6}
        />
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        className="mb-6 sm:mb-8"
      >
        <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 bg-white/70 backdrop-blur-md">
          {/* Glow Background */}
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-40" />
          <h3 className="relative text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
            <TrendingUp className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5" />User Growth
          </h3>
          <div className="h-64 sm:h-80 md:h-96 relative z-10">
            {!loading && !error && (
              <ChartComponent
                type="line"
                data={analyticsData.growthData}
                options={chartOptions}
              />
            )}
            {loading && (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="animate-pulse">Loading chart data…</div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-red-600">
                {error}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}