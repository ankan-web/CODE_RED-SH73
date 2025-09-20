import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Enhanced Google Icon with better styling
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    ></path>
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    ></path>
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    ></path>
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    ></path>
  </svg>
);

// Abstract background component with improved design
const AbstractBackground = () => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#D4E9E2] to-[#E8F4F0] rounded-2xl overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 bg-[#8FBC8F] opacity-20 rounded-full -translate-y-20 translate-x-20"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#66B29A] opacity-30 rounded-full -translate-x-16 translate-y-16"></div>
    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
    <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-[#1A936F] opacity-20 rounded-full"></div>
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const syncUserWithFirestore = async (user) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
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
      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  const handleSuccessfulLogin = async (user) => {
    try {
      await syncUserWithFirestore(user);
      const tokenResult = await user.getIdTokenResult(true);

      if (tokenResult.claims.admin === true) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error during login process:", err);
      navigate("/dashboard");
    }
  };

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
    <div className="bg-gradient-to-br from-[#F0FAFA] to-[#E0F5F5] min-h-screen font-sans text-gray-800">
      <header className="fixed top-0 left-0 right-0 p-4 lg:p-6 z-10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#1A936F]">StudentCare</h1>
          <Link
            to="/signup"
            className="border border-gray-300 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-700"
          >
            Create an Account
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-screen p-4 pt-20 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-6xl">
          {/* Left side - Illustration/Graphics */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-lg aspect-square relative overflow-hidden">
            <AbstractBackground />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#1A936F] rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Wellbeing Matters</h2>
                <p className="text-gray-600">
                  Gentle support for every student, anytime, anywhere.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm mt-8">
                <p className="text-sm text-gray-600 italic">"Taking care of your mental health is just as important as your academic success."</p>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  Log in to continue your wellbeing journey
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100"
                    type="email"
                    id="email"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-gray-100"
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex justify-end text-sm">
                  <Link to="/forgot-password" className="text-[#1A936F] hover:text-[#167d5e] font-medium">
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1A936F] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#167d5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner /> : "Log in"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
                New here?{" "}
                <Link to="/signup" className="font-semibold text-[#1A936F] hover:text-[#167d5e]">
                  Create an account
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}