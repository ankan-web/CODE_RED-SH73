import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// User-facing pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ResourceDetailPage from './pages/ResourcesPage';
import ForumPage from './pages/ForumPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './admin/components/RequireAdmin';

// Import the single admin dashboard file that contains all admin components
import AdminLayout, {
  AnalyticsPage,
  UsersPage,
  ResourcesPage as AdminResourcesPage,
  ForumPage as AdminForumPage,
  BookingsPage as AdminBookingsPage
} from './admin/AdminDashboard';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* --- User-Facing Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path='/chatbot' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path='/resources' element={<ProtectedRoute><ResourceDetailPage /></ProtectedRoute>} />
          <Route path='/forum' element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
          <Route path='/booking' element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

          {/* --- Admin Routes --- */}
          {/* --- Admin Routes --- */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            {/* This makes /admin redirect to /admin/analytics by default */}
            <Route index element={<Navigate to="analytics" replace />} />

            {/* These are the nested pages inside your AdminLayout */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="resources" element={<AdminResourcesPage />} />
            <Route path="forum" element={<AdminForumPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}

export default App;