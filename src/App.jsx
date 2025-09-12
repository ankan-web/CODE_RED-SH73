import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// Corrected the capitalization here from 'loginPage' to 'LoginPage'
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ResourceDetailPage from './pages/ResourcesPage';
import ForumPage from './pages/ForumPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';

// I have removed the import for 'LoadingPage' as it does not exist.
// Please ensure any <Route> that was using it is also removed.

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* The path for login is now correct */}
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
