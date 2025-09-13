import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path to your Firebase config
import Chart from 'chart.js/auto';

// --- REUSABLE UI COMPONENTS ---
const Icon = ({ name, className }) => {
  const icons = {
    analytics: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    resources: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    forum: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    bookings: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m14 14-2 2-2-2" /></svg>,
    arrowUp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>,
    logo: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /></svg>,
  };
  return <div className={className || ''}>{icons[name]}</div>;
};

const Card = ({ children, className }) => <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className || ''}`}>{children}</div>;
const PageHeader = ({ title }) => <header className="mb-8"><h2 className="text-3xl font-bold text-gray-800">{title}</h2></header>;
const LoadingSpinner = () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;

// --- PAGE COMPONENTS ---
export function AnalyticsPage() {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    growthPercentage: 0,
    userGrowthData: []
  });
  const [loading, setLoading] = useState(true);
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);

        // Get all users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Get users created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeUsersQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', today)
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);
        const activeToday = activeUsersSnapshot.size;

        // Get user growth data (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const dayQuery = query(
            collection(db, 'users'),
            where('createdAt', '<=', new Date(date.getTime() + 86400000)), // End of day
            where('createdAt', '>=', date)
          );
          const daySnapshot = await getDocs(dayQuery);
          last7Days.push(daySnapshot.size);
        }

        // Calculate growth percentage
        const previousDay = last7Days[5] || 1;
        const todayCount = last7Days[6] || 0;
        const growthPercentage = ((todayCount - previousDay) / previousDay) * 100;

        setUserStats({
          totalUsers,
          activeToday,
          growthPercentage,
          userGrowthData: last7Days
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, []);

  useEffect(() => {
    if (chartRef.current && userStats.userGrowthData.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            data: userStats.userGrowthData,
            fill: false,
            borderColor: '#14b8a6',
            tension: 0.4,
            pointBackgroundColor: '#14b8a6',
            pointRadius: 4
          }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#e5e7eb', borderDash: [2, 4], drawBorder: false },
              ticks: { color: '#6b7280' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#6b7280' }
            }
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [userStats.userGrowthData]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Analytics" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{userStats.totalUsers}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active today</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{userStats.activeToday}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Growth today</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{userStats.userGrowthData[6] || 0}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <Icon name="arrowUp" />
            <span>+{userStats.growthPercentage.toFixed(1)}%</span>
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">User Growth (Last 7 Days)</h3>
        <div className="h-80"><canvas ref={chartRef}></canvas></div>
      </Card>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="User Management" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Joined</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                    <img
                      className="w-8 h-8 rounded-full mr-3"
                      src={user.photoURL || `https://placehold.co/40x40/E2E8F0/475569?text=${user.displayName?.[0] || 'U'}`}
                      alt="Avatar"
                    />
                    {user.displayName || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="font-medium text-teal-600 hover:underline mr-3">Edit</button>
                    <button className="font-medium text-red-600 hover:underline">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ... rest of your components (ResourcesPage, ForumPage, BookingsPage, Sidebar, AdminLayout)

export function ResourcesPage() {
  return (
    <div>
      <PageHeader title="Resource Hub" />
      <Card>
        <p>Resource management content will go here.</p>
      </Card>
    </div>
  );
}

export function ForumPage() {
  return (
    <div>
      <PageHeader title="Forum Management" />
      <Card>
        <p>Forum management content will go here.</p>
      </Card>
    </div>
  );
}

export function BookingsPage() {
  return (
    <div>
      <PageHeader title="Booking Management" />
      <Card>
        <p>Booking management content will go here.</p>
      </Card>
    </div>
  );
}

// --- LAYOUT COMPONENTS ---
const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'users', path: '/admin/users', label: 'Users', icon: 'users' },
    { id: 'resources', path: '/admin/resources', label: 'Resources', icon: 'resources' },
    { id: 'forum', path: '/admin/forum', label: 'Forum', icon: 'forum' },
    { id: 'bookings', path: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  ];
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Icon name="logo" className="text-teal-500 w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">StudentCare</h1>
        </div>
      </div>
      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <Link 
                to={item.path} 
                className={`flex items-center px-6 py-3 mx-4 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-teal-50 text-teal-600 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon name={item.icon} className="mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// --- MAIN ADMIN LAYOUT EXPORT ---
function AdminLayout() {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800 w-full">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Outlet is the placeholder for nested routes from App.jsx */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;