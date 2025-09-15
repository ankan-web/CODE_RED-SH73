import React from 'react';
import { addTestUser } from './admin/addTestUser';
import useIsAdmin from './admin/hooks/useIsAdmin';
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
import WellnessSurveyPage from './pages/WellnessSurveyPage';

// Import the single admin dashboard file that contains all admin components
import AdminLayout from './admin/components/AdminLayout';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import UsersPage from './admin/pages/UsersPage';
import AdminResourcesPage from './admin/pages/ResourcesPage';
import AdminForumPage from './admin/pages/ForumPage';
import AdminBookingsPage from './admin/pages/BookingsPage';

function AdminButton() {
  const { isAdmin, checking } = useIsAdmin();
  if (!isAdmin || checking) return null;
  return (
    <button
      style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#14b8a6', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
      onClick={async () => {
        try {
          await addTestUser();
          alert('Test user added to Firestore!');
        } catch (err) {
          alert('Error adding user: ' + (err.message || err));
        }
      }}
    >
      Add Test User
    </button>
  );
}

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
          <Route path='/wellness-checkin' element={<ProtectedRoute><WellnessSurveyPage /></ProtectedRoute>} />

          {/* --- Admin Routes --- */}
          {/* --- Admin Routes --- */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <>
                  <AdminButton />
                  <AdminLayout />
                </>
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