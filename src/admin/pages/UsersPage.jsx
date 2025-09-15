import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, PageHeader } from '../components/Shared';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            displayName: data.displayName || 'No Name',
            email: data.email || 'No Email',
            photoURL: data.photoURL || 'https://placehold.co/40x40/cccccc/ffffff?text=?',
            status: (data.status || 'unknown').toString(),
          };
        });
        setUsers(list);
      } catch (e) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="User Management" />
      <Card>
        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                      <img className="w-8 h-8 rounded-full mr-3" src={user.photoURL} alt={`${user.displayName}'s avatar`} />
                      {user.displayName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : user.status.toLowerCase() === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="font-medium text-teal-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}


