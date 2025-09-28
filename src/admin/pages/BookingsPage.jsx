import React, { useEffect, useState } from 'react';
import { Card, PageHeader } from '../components/Shared.jsx';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, DollarSign, Users as TotalUsersIcon } from 'lucide-react';

export default function BookingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Assuming dateString is 'YYYY-MM-DD'
    const date = new Date(dateString);
    // Add a day to correct for potential timezone issues where it might show the previous day
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-6 md:p-8">
      <PageHeader title="Booking Management" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 transition-all duration-500 hover:scale-[1.03] flex items-center gap-4"
        >
          <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-3 rounded-full shadow-md">
            <TotalUsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
            <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600">{items.length}</p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="relative overflow-hidden rounded-3xl shadow-xl p-0 bg-white/70 backdrop-blur-md">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-3xl blur-2xl opacity-40" />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Counselor</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Time</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="text-center p-10 text-gray-500" colSpan={6}>Loading bookings...</td></tr>
                ) : items.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * i }}
                    className="bg-white/80 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-800 truncate">{b.userEmail || b.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{b.counselorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(b.dateISO)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{b.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{b.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-500" colSpan={6}>
                      No bookings have been made yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

