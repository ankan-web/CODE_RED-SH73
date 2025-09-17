import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
// Import firestore functions and the db instance
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase"; // Make sure db is exported from your firebase config

// A simple SVG icon for the Google logo
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.522 4.982 29.537 2.5 24 2.5C11.318 2.5 2.5 11.318 2.5 24s8.818 21.5 21.5 21.5c11.983 0 21.06-8.807 21.06-20.556c0-1.34-.123-2.624-.349-3.86z"
    ></path>
  </svg>
);

// A placeholder for the abstract background image on the left
const AbstractBackground = () => (
  <div className="absolute inset-0 w-full h-full bg-[#D4E9E2] rounded-2xl overflow-hidden">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="soft-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>
      </defs>
      <path
        d="M-50 150 Q100 50, 200 180 T450 150"
        stroke="#66B29A"
        strokeWidth="30"
        fill="none"
        strokeLinecap="round"
        style={{ filter: "url(#soft-blur)", opacity: 0.3 }}
      />
      <path
        d="M-50 250 Q150 350, 250 220 T450 250"
        stroke="#8FBC8F"
        strokeWidth="40"
        fill="none"
        strokeLinecap="round"
        style={{ filter: "url(#soft-blur)", opacity: 0.4 }}
      />
      <circle cx="320" cy="80" r="12" fill="white" style={{ opacity: 0.2 }} />
      <circle cx="340" cy="95" r="8" fill="white" style={{ opacity: 0.15 }} />
    </svg>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- NEW FUNCTION TO SYNC USER WITH FIRESTORE ---
  // This function checks if a user has a document in the 'users' collection
  // and creates one if they don't.
  const syncUserWithFirestore = async (user) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // If the document doesn't exist, create it for the existing user.
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: "active",
      }, { merge: true });
      console.log("Created Firestore document for existing user:", user.uid);
    } else {
      // If the document already exists, just update their last login time.
      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  // Unified function to handle role-based navigation after login
  const handleSuccessfulLogin = async (user) => {
    try {
      // --- THIS IS THE NEW LOGIC ---
      // Sync user data with Firestore before navigating.
      await syncUserWithFirestore(user);

      const tokenResult = await user.getIdTokenResult(true);

      if (tokenResult.claims.admin === true) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error during login process:", err);
      // Fallback to the regular dashboard if claim check or sync fails
      navigate("/dashboard");
    }
  };

  // Email/Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Email login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(result.user);
    } catch (error) {
      setError("Could not sign in with Google. Please try again.");
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F0FAFA] min-h-screen font-sans text-gray-800">
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">StudentCare</h1>
          <Link
            to="/signup"
            className="border border-gray-300 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          <div className="hidden lg:flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-sm aspect-square">
            <div className="relative w-full h-full">
              <AbstractBackground />
              <div className="relative flex items-end h-full p-4">
                <p className="text-gray-600">
                  Gentle support for every student, anytime.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
              <p className="text-gray-500 mb-8">
                Log in to continue your wellbeing journey
              </p>
              <form onSubmit={handleEmailLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100"
                    type="email"
                    id="email"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100"
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-[#1A936F] text-white font-bold py-3 px-4 rounded-full hover:bg-[#167d5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </button>
              </form>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 font-bold py-3 px-4 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="text-center text-sm text-gray-500 mt-8">
                New here?{" "}
                <Link to="/signup" className="font-bold text-teal-600 hover:text-teal-700">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
