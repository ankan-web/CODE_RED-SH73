import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ResourceDetailPage from './pages/ResourcesPage';
import ForumPage from './pages/ForumPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
  );
}

export default App;