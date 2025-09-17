import React, { useEffect, useState } from 'react';
import { Card, PageHeader } from '../components/Shared';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, DollarSign } from 'lucide-react';

export default function BookingsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 min-h-screen p-6 md:p-8">
      <PageHeader title=" Booking Management" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-slate-200/40 hover:shadow-teal-300/50 transition-all duration-500 hover:scale-[1.03] flex items-center gap-4"
        >
          <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-3 rounded-full shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
            <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600">{items.length}</p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="relative overflow-hidden rounded-3xl shadow-xl p-6 bg-white/70 backdrop-blur-md">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-3xl blur-2xl opacity-40" />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Counselor</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="bg-white border-b hover:bg-gray-50 transition-shadow hover:shadow-md cursor-pointer"
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {b.userEmail || b.userId}
                    </td>
                    <td className="px-6 py-4">{b.counselorName}</td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" /> {b.dateISO}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" /> {b.time}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" /> ₹{b.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span>
                    </td>
                  </motion.tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      No bookings yet.
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
