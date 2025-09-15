import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, PageHeader, Icon, ChartComponent } from '../components/Shared';

export default function AnalyticsPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(list);
        const bSnap = await getDocs(collection(db, 'bookings'));
        setBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalUsers = users.length;
  const activeToday = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return users.filter(u => {
      const ts = u.lastLogin?.toDate ? u.lastLogin.toDate() : (u.lastLogin ? new Date(u.lastLogin) : null);
      return ts && ts >= start;
    }).length;
  }, [users]);

  const growthData = useMemo(() => {
    const counts = new Array(12).fill(0);
    users.forEach(u => {
      const created = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null);
      if (!created || Number.isNaN(created.getTime())) return;
      const m = created.getMonth();
      counts[m] += 1;
    });
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels: monthLabels,
      datasets: [{ data: counts, borderColor: '#14b8a6', fill: false, tension: 0.35, pointBackgroundColor: '#14b8a6', pointRadius: 3 }]
    };
  }, [users]);

  const totalBookings = bookings.length;
  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.amount || 0), 0);

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e5e7eb', borderDash: [2, 4], drawBorder: false } },
      x: { grid: { display: false } }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  return (
    <div>
      <PageHeader title="Analytics" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '…' : totalUsers}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>—</span></div>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active today</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '…' : activeToday}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>—</span></div>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Bookings • Revenue</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '…' : totalBookings} • ₹{revenue}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>—</span></div>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">User Growth</h3>
        <div className="h-80">
          {!loading && !error && <ChartComponent type="line" data={growthData} options={chartOptions} />}
          {loading && <div className="text-gray-500">Loading chart…</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
      </Card>
    </div>
  );
}
