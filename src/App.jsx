import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- Import Toaster
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ResourceDetailPage from './pages/ResourcesPage';
import ForumPage from './pages/ForumPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <> {/* Use a fragment to wrap Router and Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#ffffff',
            color: '#333333',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path='/chatbot' element={<ChatPage />} />
          <Route path='/resources' element={<ResourceDetailPage />} />
          <Route path='/forum' element={<ForumPage />} />
          <Route path='/booking' element={<BookingPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

