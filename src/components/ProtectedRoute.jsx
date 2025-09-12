import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // You can add a loading spinner here while checking auth state
    return <div>Loading...</div>;
  }

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/" />;
  }

  // If user is logged in, render the child component (e.g., the Dashboard)
  return children;
};

export default ProtectedRoute;
