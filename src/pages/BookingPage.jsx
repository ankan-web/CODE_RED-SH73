import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { auth, db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// --- Mock Data ---
const currentUser = {
  name: 'Maya',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto-format=fit=crop'
};

const counselors = [
  { id: 1, name: 'Dr. Aanya Sharma', specialization: 'Anxiety, Stress Mgmt', days: 'Mon • Wed', time: '10:00–17:00', mode: 'Virtual', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1886&auto=format=fit' },
  { id: 2, name: 'Dr. Ravi Iyer', specialization: 'Depression, Relationships', days: 'Tue • Thu', time: '10:00–17:00', mode: 'Hybrid', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format=fit' },
  { id: 3, name: 'Dr. Priya Menon', specialization: 'Academic Burnout', days: 'Mon • Fri', time: '10:00–17:00', mode: 'On-campus', avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1887&auto=format=fit' },
  { id: 4, name: 'Dr. Arjun Verma', specialization: 'Grief, Adjustment', days: 'Wed • Fri', time: '10:00–17:00', mode: 'Virtual', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1887&auto=format=fit' },
];

// Mock availability - keyed by date YYYY-MM-DD
const availability = {
  '2025-09-02': ['09:30', '11:00'], '2025-09-04': ['10:00', '12:30', '14:00'], '2025-09-05': ['09:00', '15:30'],
  '2025-09-08': ['10:30'], '2025-09-10': ['09:00', '13:00', '17:00'], '2025-09-11': ['11:30', '16:00'], '2025-09-12': ['09:30'],
  '2025-09-15': ['10:00', '12:00', '15:00'], '2025-09-17': ['11:00'], '2025-09-18': ['09:30', '13:30'],
  '2025-09-22': ['10:30'], '2025-09-23': ['09:00', '12:30', '16:30'], '2025-09-25': ['11:30'], '2025-09-26': ['15:00'],
  '2025-09-29': ['10:00'],
};


// --- Helper Functions & Components ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Header = ({ user }) => (
  <header className="flex items-center justify-between p-6 bg-[#F7FCFB] sticky top-0 z-20 border-b border-gray-200/80">
    <h2 className="text-xl font-bold text-gray-800">Counselor Booking</h2>
    <img src={user.profileImageUrl} alt="User avatar" className="w-10 h-10 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/000000/FFFFFF?text=${user.name.charAt(0)}`; }} />
  </header>
);

const ConfirmationModal = ({ booking, onPay, onReschedule }) => {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-lg text-gray-800">Confirm Booking</h3>
        <div className="space-y-2 text-gray-700 my-4 text-sm">
          <p><strong className="font-semibold">Counselor:</strong> {booking.counselor.name}</p>
          <p><strong className="font-semibold">Date:</strong> {booking.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong className="font-semibold">Time:</strong> {booking.time}</p>
          <p><strong className="font-semibold">Mode:</strong> {booking.counselor.mode}</p>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-teal-50 text-teal-800 text-sm">
          Booking fee: <strong>₹1000 INR</strong>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onReschedule} className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">Reschedule</button>
          <button onClick={onPay} className="bg-[#2D9A83] text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">Pay & Book</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Booking Page Component ---
export default function BookingPage() {
  const [selectedCounselorId, setSelectedCounselorId] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date('2025-09-01'));
  const [selectedSlot, setSelectedSlot] = useState(null); // { date: Date, time: string }
  const [bookedMap, setBookedMap] = useState({}); // { 'YYYY-MM-DD|time': true }

  const changeMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedSlot(null);
  };

  const handleSlotSelect = (date, time) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    setSelectedSlot({ date: selectedDate, time });
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayAndBook = async () => {
    const user = auth.currentUser;
    if (!user) { alert('Please sign in to book.'); return; }
    if (!selectedSlot) return;

    const ok = await loadRazorpay();
    if (!ok) { alert('Payment SDK failed to load.'); return; }

    const key = import.meta?.env?.VITE_RAZORPAY_KEY_ID || window.RAZORPAY_KEY_ID || '';
    if (!key) {
      alert('Razorpay key not configured. Set VITE_RAZORPAY_KEY_ID (demo mode).');
    }

    const amountPaise = 1000 * 100;
    const options = {
      key,
      amount: amountPaise,
      currency: 'INR',
      name: 'MindEase',
      description: 'Counseling Session Booking',
      handler: async function (response) {
        const booking = {
          userId: user.uid,
          userEmail: user.email || null,
          counselorId: selectedCounselor.id,
          counselorName: selectedCounselor.name,
          dateISO: selectedSlot.date.toISOString().slice(0, 10),
          time: selectedSlot.time,
          amount: 1000,
          currency: 'INR',
          status: 'confirmed',
          paymentId: response?.razorpay_payment_id || null,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'bookings'), booking);
        const keySlot = `${booking.dateISO}|${booking.time}`;
        setBookedMap(prev => ({ ...prev, [keySlot]: true }));
        setSelectedSlot(null);
        alert('Payment successful. Your appointment is confirmed.');
      },
      prefill: { name: user.displayName || user.email || 'User', email: user.email || undefined },
      theme: { color: '#2D9A83' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day++);
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  };

  const calendarGrid = getCalendarGrid();
  const monthSlots = useMemo(() => {
    // default: two time slots daily 10:00 and 16:00 on weekdays
    const slotsByDate = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d).getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      slotsByDate[key] = ['10:00', '16:00'];
    }
    return slotsByDate;
  }, [currentDate]);
  const selectedCounselor = counselors.find(c => c.id === selectedCounselorId);

  return (
    <div className="flex bg-[#F7FCFB] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header user={currentUser} />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Counselors List */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-800">Counselors</h3>
            {counselors.map(c => (
              <div key={c.id} onClick={() => setSelectedCounselorId(c.id)} className={`p-3 rounded-xl flex items-center space-x-4 cursor-pointer transition-colors ${selectedCounselorId === c.id ? 'bg-[#E6F3F0]' : 'bg-white hover:bg-gray-50'}`}>
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-sm text-gray-600">Specialization: {c.specialization}</p>
                  <p className="text-xs text-gray-500">{c.days} • {c.time} • {c.mode}</p>
                </div>
                {selectedCounselorId === c.id && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
              </div>
            ))}
          </div>
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <div className="flex space-x-2">
                <button onClick={() => changeMonth(-1)} className="px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600">&lt; Prev</button>
                <button onClick={() => changeMonth(1)} className="px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600">Next &gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {dayNames.map(day => <div key={day} className="font-semibold text-gray-500 py-2">{day}</div>)}
              {calendarGrid.flat().map((day, index) => {
                const dateKey = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const slots = dateKey ? monthSlots[dateKey] : null;
                return (
                  <div key={index} className="py-1 min-h-[80px]">
                    {day && <p className="mb-1">{day}</p>}
                    {slots ? (
                      <div className="space-y-1">
                        {slots.map(time => (
                          <button key={time} onClick={() => handleSlotSelect(day, time)}
                            className={`w-full text-xs font-semibold py-1 rounded ${bookedMap[`${dateKey}|${time}`] ? 'bg-green-500 text-white' : (selectedSlot?.date.getDate() === day && selectedSlot?.time === time ? 'bg-[#2D9A83] text-white' : 'bg-[#E6F3F0] text-gray-700 hover:bg-[#cce2dc]')}`}>
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (day && <p className="text-xs text-gray-300">No slots</p>)}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Select a date and an available time slot to proceed.</p>
          </div>
        </div>
      </main>
      <ConfirmationModal
        booking={selectedSlot ? { ...selectedSlot, counselor: selectedCounselor } : null}
        onPay={handlePayAndBook}
        onReschedule={() => setSelectedSlot(null)}
      />
    </div>
  );
}

