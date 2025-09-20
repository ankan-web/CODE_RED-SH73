import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// --- Custom Hook for Dark Mode (No changes) ---
const useDarkMode = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme || (prefersDark ? "dark" : "light");
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return [theme, setTheme];
};

// --- SVG Icons (No changes) ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8-9 8s9 3.582 9 8z" /></svg>);
const ResourcesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /></svg>);
const ForumIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6l4 4z" /></svg>);
const BookingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const BellIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const CalendarCheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>);

// --- Emotion Detection Modal (Updated Logic) ---
const EmotionDetectionModal = ({ isOpen, onCheckinComplete }) => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [dominantEmotion, setDominantEmotion] = useState(null);

  useEffect(() => {
    const setupDetector = async () => {
      if (isOpen) {
        // Reset state when opening
        setDominantEmotion(null);
        setStatus("Loading AI models...");
        try {
          if (!window.faceapi) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
              script.onload = resolve;
              script.onerror = reject;
              document.body.appendChild(script);
            });
          }
          const MODEL_URL = '/models';
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
          ]);
          startVideo();
        } catch (error) { setStatus("Error: Could not load AI models."); }
      } else { stopVideo(); }
    };
    setupDetector();
    return () => stopVideo();
  }, [isOpen]);

  const startVideo = () => {
    setStatus("Starting camera...");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(err => setStatus("Error: Camera permission denied."));
  };

  const stopVideo = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleVideoPlay = () => {
    intervalRef.current = setInterval(async () => {
      if (videoRef.current && window.faceapi) {
        const detections = await window.faceapi.detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (detections.length > 0) {
          const emotions = detections[0].expressions;
          const primaryEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
          setStatus(`Detected: ${primaryEmotion}`);
          setDominantEmotion(primaryEmotion);
        } else {
          setStatus("Looking for face...");
          setDominantEmotion(null);
        }
      }
    }, 500);
  };

  const handleAction = () => {
    // This function now triggers the navigation
    onCheckinComplete(dominantEmotion);
  };

  // The close icon now just closes the modal without sending data
  const handleClose = () => onCheckinComplete(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md relative transform animate-in zoom-in duration-300">
        <button onClick={handleClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200">
          <CloseIcon />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <CameraIcon />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Emotion Check-in
          </h2>
          <p className="text-gray-500 mt-2">Center your face in the camera view for AI analysis.</p>
        </div>
        <div className="relative w-full mx-auto rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
          <video ref={videoRef} onPlay={handleVideoPlay} autoPlay muted playsInline className="w-full h-auto bg-gray-900"></video>
          <div className="absolute inset-0 border-2 border-dashed border-purple-300/50 rounded-2xl pointer-events-none"></div>
        </div>
        <div className="mt-6 text-center text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent p-4 bg-gray-50/50 rounded-xl border border-gray-100 capitalize">
          {status}
        </div>

        <div className="mt-6">
          <button
            onClick={handleAction}
            disabled={!dominantEmotion}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Discuss with MindEase AI
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components with Premium Design ---
const NavItem = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
          ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600 font-semibold shadow-sm border border-teal-100"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:scale-105"
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-500 to-blue-500 rounded-r-full"></div>
      )}
      <div className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span>{children}</span>
    </Link>
  );
};

const Sidebar = () => (
  <aside className="bg-white/80 backdrop-blur-xl w-72 min-h-screen p-6 flex-col justify-between hidden lg:flex border-r border-gray-100/50 shadow-2xl">
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent p-4">
          MindEase
        </h1>
        <div className="h-px bg-gradient-to-r from-teal-200 to-blue-200 mx-4"></div>
      </div>
      <nav className="space-y-2">
        <p className="text-xs text-gray-400 font-semibold uppercase px-4 mb-4 tracking-wide">Navigation</p>
        <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
        <NavItem to="/chatbot" icon={<ChatIcon />}>AI Companion</NavItem>
        <NavItem to="/resources" icon={<ResourcesIcon />}>Resources</NavItem>
        <NavItem to="/forum" icon={<ForumIcon />}>Community</NavItem>
        <NavItem to="/booking" icon={<BookingIcon />}>Premium Sessions</NavItem>
      </nav>
    </div>
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-lg">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
        <CalendarCheckIcon />
      </div>
      <h3 className="font-bold text-gray-800 mb-2">Daily Wellness Check</h3>
      <p className="text-sm text-gray-600 mb-4">Track your mental health journey with our AI-powered mood analysis.</p>
      <Link
        to="/checkin"
        className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-xl w-full hover:shadow-md transition-all duration-200 block text-center hover:scale-105"
      >
        Start Check-in
      </Link>
    </div>
  </aside>
);

const Header = ({ theme, setTheme, user, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pfpInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <header className="flex items-center justify-between p-6 bg-white/70 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100/50 shadow-sm">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search resources, topics, mentors..."
          className="w-full bg-white/80 backdrop-blur-sm rounded-2xl pl-12 pr-4 py-3 border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-sm hover:shadow-md transition-all duration-200"
        />
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-11 h-11 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 text-gray-600 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 hover:scale-105 transition-all duration-200 shadow-sm"
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="w-11 h-11 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 text-gray-600 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 hover:scale-105 transition-all duration-200 shadow-sm relative">
          <BellIcon />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${pfpInitial}&background=E6F3F0&color=006A57`}
              alt="Avatar"
              className="w-11 h-11 rounded-2xl border-2 border-white shadow-lg"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-30 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold truncate text-gray-800">{user?.displayName || "Anonymous User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "No email provided"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogoutIcon />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Card = ({ children, className = "", gradient = false, hover = true }) => (
  <div className={`
    ${gradient
      ? 'bg-gradient-to-br from-white to-gray-50/50'
      : 'bg-white/80 backdrop-blur-sm'
    } 
    rounded-2xl p-8 shadow-xl border border-gray-100/50 
    ${hover ? 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
  const [theme, setTheme] = useDarkMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmotionModalOpen, setIsEmotionModalOpen] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoadingBookings(true);
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserBookings(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getDisplayName = (user) => {
    if (!user) return '...';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  const handleCheckinComplete = (emotion) => {
    setIsEmotionModalOpen(false);
    if (emotion) {
      navigate('/chatbot', { state: { detectedEmotion: emotion } });
    }
  };

  const formatBookingDate = (dateISO, time) => {
    if (!dateISO || !time) return 'Invalid date';
    try {
      const date = new Date(dateISO);
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} at ${time}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header theme={theme} setTheme={setTheme} user={user} handleLogout={handleLogout} />

        <div className="p-8 relative z-10">
          <div className="mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome back, {getDisplayName(user)}
            </h2>
            <p className="text-gray-500 text-lg">Your personalized wellness ecosystem awaits</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="xl:col-span-8 space-y-8">
              {/* AI Chat Section */}
              <Card gradient={true} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-100/50 to-transparent rounded-bl-[100px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-2xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-3">
                        AI Wellness Companion
                      </h3>
                      <p className="text-gray-600 max-w-md leading-relaxed">
                        Connect with our advanced AI companion for personalized support, guidance, and meaningful conversations about your mental wellness journey.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                        24/7 Available
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/chatbot")}
                    className="group bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                    <ChatIcon />
                    <span>Start Conversation</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </Card>

              {/* Community Forum Section */}
              <Card gradient={true}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-2xl text-gray-800 mb-2">Community Pulse</h3>
                    <p className="text-gray-600">Join meaningful discussions with our supportive community</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                      Trending Now
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div
                    className="group p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-100"
                    onClick={() => navigate("/forum")}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          Managing presentation anxiety: Techniques that actually work
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">24 responses • 3 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="group p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-100"
                    onClick={() => navigate("/forum")}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                          Study-life balance during finals: Share your strategies
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">18 responses • 5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/forum")}
                  className="mt-6 w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  Explore All Discussions
                </button>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-4 space-y-8">
              {/* Emotion Check-in Card */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-[60px]"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg">
                      <CameraIcon />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Emotion Analysis</h3>
                      <p className="text-sm text-gray-500">AI-powered mood detection</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Use advanced facial recognition to analyze your emotional state and receive personalized wellness recommendations.
                  </p>
                  <button
                    onClick={() => setIsEmotionModalOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CameraIcon />
                    <span>Start Analysis</span>
                  </button>
                </div>
              </Card>

              {/* Featured Resources Card */}
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-gray-800">Wellness Library</h3>
                  <Link
                    to="/resources"
                    className="text-teal-600 hover:text-teal-700 font-semibold text-sm flex items-center space-x-1 group"
                  >
                    <span>View All</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="group flex justify-between items-center p-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-teal-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-teal-600">Mindful Breathing Techniques</p>
                        <p className="text-xs text-gray-500">5 min read</p>
                      </div>
                    </div>
                    <Link
                      to="/resources"
                      className="font-semibold text-sm text-teal-600 hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Read
                    </Link>
                  </div>
                  <div className="group flex justify-between items-center p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-blue-600">Sleep Optimization Guide</p>
                        <p className="text-xs text-gray-500">8 min read</p>
                      </div>
                    </div>
                    <Link
                      to="/resources"
                      className="font-semibold text-sm text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Read
                    </Link>
                  </div>
                  <div className="group flex justify-between items-center p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-purple-600">Stress Management for Students</p>
                        <p className="text-xs text-gray-500">12 min read</p>
                      </div>
                    </div>
                    <Link
                      to="/resources"
                      className="font-semibold text-sm text-purple-600 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Read
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Bookings Overview Card */}
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Your Sessions</h3>
                    <p className="text-sm text-gray-500">Upcoming premium appointments</p>
                  </div>
                  <Link
                    to="/booking"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center space-x-1 group"
                  >
                    <span>Manage</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {loadingBookings ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : userBookings.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.map(booking => (
                      <div key={booking.id} className="group p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                              {booking.counselorName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                {booking.counselorName || 'Unknown Counselor'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatBookingDate(booking.dateISO, booking.time)}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {booking.status || 'confirmed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <BookingIcon />
                    </div>
                    <p className="text-gray-500 mb-4">No upcoming sessions</p>
                    <Link
                      to="/booking"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <BookingIcon />
                      <span>Book Session</span>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Bottom Section - Quick Actions */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Take Control of Your Wellness Journey</h2>
                  <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                    Access premium tools and resources designed by mental health professionals to support your growth and wellbeing.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ChatIcon />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">24/7 AI Support</h3>
                    <p className="text-indigo-100 text-sm">Always available when you need someone to talk to</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <BookingIcon />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Expert Sessions</h3>
                    <p className="text-indigo-100 text-sm">Connect with certified mental health professionals</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ResourcesIcon />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Curated Resources</h3>
                    <p className="text-indigo-100 text-sm">Evidence-based tools and techniques for every situation</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <EmotionDetectionModal isOpen={isEmotionModalOpen} onCheckinComplete={handleCheckinComplete} />
    </div>
  );
}