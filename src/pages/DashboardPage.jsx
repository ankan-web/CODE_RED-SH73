import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure this path is correct

// --- Custom Hook for Dark Mode ---
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

// --- SVG Icons (No changes needed) ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const ResourcesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /></svg>);
const ForumIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6l4 4z" /></svg>);
const BookingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const BellIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);


// --- Reusable Components ---
const CardActionButton = ({ children, to }) => (<Link to={to} className="font-semibold text-sm text-teal-600 hover:text-teal-700 bg-teal-50/50 hover:bg-teal-100/70 px-4 py-1.5 rounded-full transition-colors">{children}</Link>);

const NavItem = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-[#E6F3F0] text-[#006A57] font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>{icon}<span>{children}</span></Link>);
};

function Sidebar() {
  return (
    <aside className="bg-white w-64 min-h-screen p-4 flex-col justify-between hidden lg:flex border-r border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 p-4">MindEase</h1>
        <nav className="mt-8 space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase px-4 mb-2">Main</p>
          <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
          <NavItem to="/chatbot" icon={<ChatIcon />}>Chatbot</NavItem>
          <NavItem to="/resources" icon={<ResourcesIcon />}>Resources</NavItem>
          <NavItem to="/forum" icon={<ForumIcon />}>Forum</NavItem>
          <NavItem to="/booking" icon={<BookingIcon />}>Booking</NavItem>
        </nav>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200/80">
        <h3 className="font-bold text-gray-800">Daily Check-in</h3>
        <p className="text-sm text-gray-600 mt-1">Reflect in 2 minutes. Track mood and habits.</p>
        <Link to="/checkin" className="bg-white border border-gray-300/90 text-sm font-semibold mt-4 px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition-colors block text-center">Start now</Link>
      </div>
    </aside>
  );
}

const Header = ({ theme, setTheme, user, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Derives the initial for the profile picture fallback
  const pfpInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <header className="flex items-center justify-between p-6 bg-[#F0FAFA] sticky top-0 z-20 border-b border-gray-200/80">
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
        <input type="text" placeholder="Search resources, topics, mentors" className="w-full bg-white rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">{theme === "light" ? <MoonIcon /> : <SunIcon />}</button>
        <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"><BellIcon /></button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img
              src={user?.photoURL || `https://placehold.co/40x40/000000/FFFFFF?text=${pfpInitial.toUpperCase()}`}
              alt="User avatar"
              className="w-10 h-10 rounded-full"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-30 border border-gray-200/80">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-700 truncate">{user?.displayName || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "No email"}</p>
              </div>
              <button onClick={handleLogout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
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

const Card = ({ children, className = "" }) => (<div className={`bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200/70 ${className}`}>{children}</div>);

// --- Dashboard Page ---
export default function DashboardPage() {
  const [theme, setTheme] = useDarkMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Helper function to derive a display name
  const getDisplayName = (user) => {
    if (!user) return 'there';
    if (user.displayName) return user.displayName;
    if (user.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'User';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const displayName = getDisplayName(user);

  return (
    <div className="flex bg-[#F0FAFA] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1">
        <Header theme={theme} setTheme={setTheme} user={user} handleLogout={handleLogout} />
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome back, {displayName}
              </h2>
              <p className="text-gray-500 mt-1">Your wellbeing hub at a glance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Chat with MindEase</h3>
                    <p className="text-sm text-gray-600 mt-2 max-w-md">Have a question or need to talk? Start a supportive chat in seconds.</p>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">24/7</span>
                </div>
                <button onClick={() => navigate("/chatbot")} className="bg-[#2D9A83] text-white font-bold py-2 px-6 rounded-lg mt-4 hover:bg-teal-700 transition-colors">Open Chatbot</button>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Forum - Trending</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate("/forum")}>How do you manage stress before presentations?</p>
                  <p className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate("/forum")}>Best tips to find a study-life balance?</p>
                  <p className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate("/forum")}>Any guided meditations you love?</p>
                </div>
                <Link to="/forum" className="text-teal-600 hover:text-teal-700 font-semibold text-sm mt-4 inline-block">Go to Forum</Link>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Featured Resources</h3>
                  <Link to="/resources" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">See all</Link>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Mindful breathing guide</p><CardActionButton to="/resources">Read</CardActionButton></div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Better sleep in finals week</p><CardActionButton to="/resources">Read</CardActionButton></div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Set healthy study boundaries</p><CardActionButton to="/resources">Read</CardActionButton></div>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Book a Session</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">Next 7 days</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Peer listener</p><CardActionButton to="/booking">Schedule</CardActionButton></div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Campus counselor</p><CardActionButton to="/booking">Schedule</CardActionButton></div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><p className="text-gray-700 pl-1">Virtual session</p><CardActionButton to="/booking">Schedule</CardActionButton></div>
                </div>
                <p className="text-xs text-gray-500 mt-4">You can cancel or reschedule up to 24 hours before your appointment.</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

