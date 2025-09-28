import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// --- UPDATED: Indian Counselor Data ---
const premiumCounselors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Cognitive Behavioral Therapy",
    experience: "12 years",
    rating: 4.9,
    reviews: 247,
    price: 1499,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    bio: "AIIMS-trained specialist in anxiety and depression with a focus on evidence-based treatments for students.",
    availability: ["Mon", "Wed", "Fri"]
  },
  {
    id: 2,
    name: "Dr. Rohan Gupta",
    specialty: "Exam Stress & Career Counseling",
    experience: "15 years",
    rating: 4.95,
    reviews: 312,
    price: 1999,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    bio: "Expert in helping students navigate academic pressure and make confident career choices.",
    availability: ["Tue", "Thu", "Sat"]
  },
  {
    id: 3,
    name: "Dr. Ananya Reddy",
    specialty: "Relationships & Family Therapy",
    experience: "10 years",
    rating: 4.88,
    reviews: 189,
    price: 1299,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    bio: "Award-winning therapist specializing in relationship dynamics and communication strategies for young adults.",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },
  {
    id: 4,
    name: "Dr. Vikram Singh",
    specialty: "Addiction & Habit Formation",
    experience: "18 years",
    rating: 4.92,
    reviews: 426,
    price: 2499,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    bio: "Pioneer in addiction treatment with a holistic approach to recovery and building positive habits.",
    availability: ["Wed", "Thu", "Fri", "Sat"]
  }
];

// Time slots for booking
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Premium Booking Page Component
export default function PremiumBookingPage() {
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingStep, setBookingStep] = useState(1);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      if (selectedCounselor) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (selectedCounselor.availability.includes(dayName)) {
          dates.push(date.toISOString().split('T')[0]);
        }
      } else {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const handleBooking = async () => {
    if (authLoading || !user || !user.uid) {
      alert("Authentication state is not ready. Please wait a moment or try refreshing the page.");
      return;
    }
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      alert("Please select all required fields");
      return;
    }
    setIsLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('counselorId', '==', selectedCounselor.id.toString()),
        where('dateISO', '==', selectedDate),
        where('time', '==', selectedTime),
        where('status', '==', 'confirmed')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("This time slot is no longer available. Please choose another time.");
        setIsLoading(false);
        return;
      }
      const bookingData = {
        userId: user.uid,
        counselorId: selectedCounselor.id.toString(),
        counselorName: selectedCounselor.name,
        counselorSpecialty: selectedCounselor.specialty,
        dateISO: selectedDate,
        time: selectedTime,
        amount: selectedCounselor.price,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        userEmail: user.email,
        userName: user.displayName || user.email || 'Unknown User',
        sessionDuration: 50,
        bookingType: 'premium'
      };
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log("Booking created successfully with ID: ", docRef.id);
      setBookingSuccess(true);
      setBookingStep(4);
    } catch (error) {
      console.error("=== BOOKING ERROR ===", error);
      let alertMessage = `Booking error: ${error.message}\nCheck browser console for details.`;
      if (error.code === 'permission-denied') {
        alertMessage = `Permission denied. Please ensure you are logged in and your Firestore rules are deployed correctly. Debug info:\n- Your UID: ${user?.uid}\n- Auth UID: ${auth.currentUser?.uid}`;
      }
      alert(alertMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const resetBooking = () => {
    setSelectedCounselor(null);
    setSelectedDate("");
    setSelectedTime("");
    setBookingStep(1);
    setBookingSuccess(false);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <Link to="/dashboard" className="text-2xl font-bold text-teal-600">MindEase</Link>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors">Back to Dashboard</Link>
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=E6F3F0&color=006A57`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 hidden md:block">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Premium Counseling Sessions</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Book one-on-one sessions with our expert mental health professionals.
            Personalized care tailored to your unique needs.
          </p>
        </div>

        {!bookingSuccess ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gray-100 px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-teal-600">Step {bookingStep} of 3</span>
                <span className="text-sm text-gray-500">Premium Booking</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(bookingStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {bookingStep === 1 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Counselor</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {premiumCounselors.map(counselor => (
                    <div
                      key={counselor.id}
                      className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${selectedCounselor?.id === counselor.id
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50'
                        : 'border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => setSelectedCounselor(counselor)}
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={counselor.image}
                          alt={counselor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{counselor.name}</h3>
                          <p className="text-sm text-teal-600">{counselor.specialty}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-600 ml-1">{counselor.rating} ({counselor.reviews} reviews)</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{counselor.experience} experience</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {counselor.availability.map(day => (
                              <span key={day} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">₹{counselor.price}</span>
                          <span className="block text-xs text-gray-500">per session</span>
                        </div>
                      </div>
                      {selectedCounselor?.id === counselor.id && (
                        <p className="text-sm text-gray-600 mt-3">{counselor.bio}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!selectedCounselor}
                    className={`px-6 py-3 rounded-lg font-medium ${selectedCounselor
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Continue to Date & Time
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Date</h2>
                <p className="text-gray-600 mb-6">Choose from available dates for your session with {selectedCounselor.name}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-8">
                  {getAvailableDates().map(date => (
                    <div
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${selectedDate === date
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                        }`}
                    >
                      <div className="text-xs font-medium uppercase">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold mt-1">
                        {new Date(date).getDate()}
                      </div>
                      <div className="text-xs">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    disabled={!selectedDate}
                    className={`px-6 py-3 rounded-lg font-medium ${selectedDate
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Continue to Time Selection
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Time</h2>
                <p className="text-gray-600 mb-6">Choose your preferred time on {formatDate(selectedDate)}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 border rounded-lg text-center transition-colors ${selectedTime === time
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Counselor:</span>
                      <span className="font-medium">{selectedCounselor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-teal-600">₹{selectedCounselor.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={!selectedTime || isLoading}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${selectedTime && !isLoading
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your session with {selectedCounselor.name} on {formatDate(selectedDate)} at {selectedTime} has been confirmed.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Counselor:</span>
                  <span className="font-medium">{selectedCounselor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formatDate(selectedDate)} at {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">50 minutes</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-xl font-bold text-teal-600">₹{selectedCounselor.price}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to your inbox with meeting details and instructions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetBooking}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
              >
                Book Another Session
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {bookingStep === 1 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {"★".repeat(5)}
                </div>
                <p className="text-gray-600 italic mb-4">
                  "Dr. Sharma's approach to handling my exam anxiety was a game-changer. The techniques are practical and really work. Worth every rupee."
                </p>
                <div className="flex items-center">
                  <img src="https://placehold.co/48x48/E2E8F0/475569?text=AS" alt="Aarav S." className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Aarav S.</p>
                    <p className="text-sm text-gray-500">Engineering Student, NIT Durgapur</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {"★".repeat(5)}
                </div>
                <p className="text-gray-600 italic mb-4">
                  "I was feeling completely lost about my career. After just 3 sessions with Dr. Gupta, I have a clear path forward. Incredible expertise."
                </p>
                <div className="flex items-center">
                  <img src="https://placehold.co/48x48/DDBEA9/A5A58D?text=RT" alt="Rohan T." className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Rohan T.</p>
                    <p className="text-sm text-gray-500">Commerce Student</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {"★".repeat(5)}
                </div>
                <p className="text-gray-600 italic mb-4">
                  "The booking process was so simple and the quality of care is exceptional. MindEase sets a new standard for student wellness."
                </p>
                <div className="flex items-center">
                  <img src="https://placehold.co/48x48/CB997E/FFE8D6?text=SL" alt="Sneha L." className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Sneha L.</p>
                    <p className="text-sm text-gray-500">Medical Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingStep === 1 && (
          <div className="mt-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-12">Premium Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Confidential</h3>
                <p className="text-white/80">End-to-end encrypted sessions for complete privacy</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Flexible</h3>
                <p className="text-white/80">Schedule sessions at your convenience, 24/7 availability</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Effective</h3>
                <p className="text-white/80">Evidence-based approaches with proven results</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Personalized</h3>
                <p className="text-white/80">Tailored treatment plans for your specific needs</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-teal-600 font-bold text-xl mb-4 md:mb-0">MindEase</div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-teal-600">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-teal-600">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-teal-600">Contact</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} MindEase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

