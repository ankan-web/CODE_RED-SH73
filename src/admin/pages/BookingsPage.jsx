import React, { useEffect, useState } from 'react';
import { Card, PageHeader } from '../components/Shared';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function BookingsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <PageHeader title="Booking Management" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
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
              {items.map(b => (
                <tr key={b.id} className="bg-white border-b">
                  <td className="px-6 py-3">{b.userEmail || b.userId}</td>
                  <td className="px-6 py-3">{b.counselorName}</td>
                  <td className="px-6 py-3">{b.dateISO}</td>
                  <td className="px-6 py-3">{b.time}</td>
                  <td className="px-6 py-3">₹{b.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-6 py-6 text-gray-500" colSpan={6}>No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


