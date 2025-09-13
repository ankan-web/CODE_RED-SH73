import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!tokenResult.claims?.admin);
      } catch (e) {
        console.error(e);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, []);

  if (checking) return <div className="flex items-center justify-center min-h-screen">Checking permissions...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
