import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Core Imports ---
import { useLocation, useNavigate, Link } from 'react-router-dom';

// --- Firebase Imports & Initialization ---
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

let auth;
// This logic safely initializes Firebase, preventing crashes if the config is missing.
try {
  const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
  const firebaseConfig = JSON.parse(firebaseConfigStr);
  if (firebaseConfig && firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("Firebase config not found. Functionality will be limited.");
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

// --- AI Service ---
// This function handles the actual API calls to the Google Gemini API.
async function getAiChatResponse(message) {
  // IMPORTANT: Leave apiKey as an empty string. The environment will provide it.
  const apiKey = "AIzaSyAcxEbgjczDyOfagdOGAAAsUp2HE_fvr6A";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt =
    "You are MindEase, a friendly and supportive mental wellness assistant for students. Your tone is calm, encouraging, and empathetic. Do not provide medical advice, but offer helpful, supportive guidance and resources. Keep your responses concise and easy to read.";

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: message }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "I'm not sure how to respond, but I'm here to listen.";
  } catch (error) {
    console.error("Error calling AI Service:", error);
    return "I'm sorry, but I'm having a little trouble connecting right now. Please try again in a moment.";
  }
}

// --- SVG Icons ---
const PaperPlaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const AttachmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const ResourcesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /></svg>);
const ForumIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6l4 4z" /></svg>);
const BookingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

// --- Reusable Components ---
const SuggestionCard = ({ title, description, onClick }) => (
  <div onClick={onClick} className="bg-white/70 hover:bg-white border border-gray-200/80 rounded-xl p-4 cursor-pointer transition-all duration-300 group w-full max-w-xs text-center">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

const NavItem = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (<Link to={to} className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-[#E6F3F0] text-[#006A57] font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>{icon}<span>{children}</span></Link>);
};

const Sidebar = () => (
  <aside className="bg-white w-64 min-h-screen p-4 flex-col justify-between hidden lg:flex border-r border-gray-100">
    <div>
      <h1 className="text-2xl font-bold text-gray-800 p-4">MindEase</h1>
      <nav className="mt-8 space-y-2">
        <p className="text-xs text-gray-400 font-semibold uppercase px-4 mb-2">Main</p>
        <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
        {/* We need a different SVG icon for the Chat link here */}
        <NavItem to="/chatbot" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8-9 8s9 3.582 9 8z" /></svg>}>Chatbot</NavItem>
        <NavItem to="/resources" icon={<ResourcesIcon />}>Resources</NavItem>
        <NavItem to="/forum" icon={<ForumIcon />}>Forum</NavItem>
        <NavItem to="/booking" icon={<BookingIcon />}>Booking</NavItem>
      </nav>
    </div>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200/80">
      <h3 className="font-bold text-gray-800">Daily Check-in</h3>
      <p className="text-sm text-gray-600 mt-1">Reflect in 2 minutes. Track mood and habits.</p>
      <Link to="/checkin" className="bg-white border border-gray-300/90 text-sm font-semibold mt-4 px-4 py-2 rounded-lg w-full hover:bg-gray-100 block text-center">Start now</Link>
    </div>
  </aside>
);

const ChatSidebar = ({ isOpen, toggleSidebar }) => (
  <aside className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-100 shadow-lg transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="flex justify-between items-center p-4 border-b">
      <p className="text-xs text-gray-400 font-semibold uppercase">Past Chats</p>
      <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-200 transition-colors">✕</button>
    </div>
    <nav className="space-y-2 p-4">
      <div className="block px-4 py-3 rounded-lg bg-[#E6F3F0]"><h3 className="font-semibold text-gray-800">Exam Stress</h3><p className="text-sm text-gray-500">Today, 10:12</p></div>
      <div className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><h3 className="font-semibold text-gray-800">Sleep Routine</h3><p className="text-sm text-gray-500">Yesterday</p></div>
    </nav>
  </aside>
);

// --- Main Chat Page Component ---
export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [isChatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const aiResponse = await getAiChatResponse(messageText);
      const botMessage = { sender: 'bot', text: aiResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: "Sorry, I couldn't get a response. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const emotion = location.state?.detectedEmotion;
    if (emotion && messages.length === 0) {
      const startingPrompt = `I just did a quick emotion check-in and I'm feeling ${emotion}. Can we talk about it?`;
      handleSendMessage(startingPrompt);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, messages.length]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage(suggestionText);
  };

  const ChatHeader = ({ toggleSidebar }) => (
    <header className="flex items-center justify-between p-4 bg-[#F0FAFA] sticky top-0 z-10 border-b border-gray-200/80">
      <div className="flex items-center space-x-3">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><MenuIcon /></button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">MindEase Chat</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-sm text-gray-600">Online</p>
          </div>
        </div>
      </div>
      {user && (
        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}`} alt="User avatar" className="w-10 h-10 rounded-full" />
      )}
    </header>
  );

  return (
    <div className="flex bg-[#F0FAFA] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen">
        <ChatHeader toggleSidebar={() => setChatSidebarOpen(!isChatSidebarOpen)} />
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">MindEase</h1>
                <p className="text-gray-600 mt-2">How can I help you today?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-3xl">
                <SuggestionCard title="I'm feeling anxious" description="Get tips to manage anxiety." onClick={() => handleSuggestionClick("I'm feeling anxious lately, can you give me some tips?")} />
                <SuggestionCard title="Trouble sleeping" description="Explore ways to improve sleep." onClick={() => handleSuggestionClick("I'm having trouble sleeping, what can I do?")} />
                <SuggestionCard title="Stressed about exams" description="Find strategies to cope with stress." onClick={() => handleSuggestionClick("I'm really stressed about my upcoming exams.")} />
                <SuggestionCard title="Just want to talk" description="Start an open conversation." onClick={() => handleSuggestionClick("I feel a bit down and just want to talk.")} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AI</div>}
                  <div className={`max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                    {msg.sender === 'bot' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AI</div>
                  <div className="max-w-md px-4 py-2 rounded-xl bg-white text-gray-500 border border-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="p-4 bg-[#F0FAFA] border-t border-gray-200/80">
          <form onSubmit={handleFormSubmit}>
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isLoading ? "MindEase is thinking..." : "Type your message..."}
                className="w-full bg-white rounded-lg pl-4 pr-32 py-3 border border-gray-300/90 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                <button type="button" className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50" disabled={isLoading}>
                  <AttachmentIcon />
                </button>
                <button type="submit" className="bg-[#2D9A83] text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400" disabled={isLoading}>
                  <span>Send</span>
                  <PaperPlaneIcon />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <ChatSidebar isOpen={isChatSidebarOpen} toggleSidebar={() => setChatSidebarOpen(!isChatSidebarOpen)} />
    </div>
  );
}
