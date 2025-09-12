import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

// A simple SVG icon for the Google logo
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.522 4.982 29.537 2.5 24 2.5C11.318 2.5 2.5 11.318 2.5 24s8.818 21.5 21.5 21.5c11.983 0 21.06-8.807 21.06-20.556c0-1.34-.123-2.624-.349-3.86z"></path>
  </svg>
);

// A placeholder for the abstract background image on the left
const AbstractBackground = () => (
  <div className="absolute inset-0 w-full h-full bg-[#D4E9E2] rounded-2xl overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>
      </defs>
      <path d="M-50 150 Q100 50, 200 180 T450 150" stroke="#66B29A" strokeWidth="30" fill="none" strokeLinecap="round" style={{ filter: 'url(#soft-blur)', opacity: 0.3 }} />
      <path d="M-50 250 Q150 350, 250 220 T450 250" stroke="#8FBC8F" strokeWidth="40" fill="none" strokeLinecap="round" style={{ filter: 'url(#soft-blur)', opacity: 0.4 }} />
      <circle cx="320" cy="80" r="12" fill="white" style={{ opacity: 0.2 }} />
      <circle cx="340" cy="95" r="8" fill="white" style={{ opacity: 0.15 }} />
    </svg>
  </div>
);


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email/Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = '/dashboard';
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="bg-[#F0FAFA] min-h-screen font-sans text-gray-800">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">StudentCare</h1>
          <a href="#" className="border border-gray-300 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Need help?
          </a>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">

          {/* Left Side: Image Panel */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-sm aspect-square">
            <div className="relative w-full h-full">
              <AbstractBackground />
              <div className="relative flex items-end h-full p-4">
                <p className="text-gray-600">Gentle support for every student, anytime.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
              <p className="text-gray-500 mb-8">Log in to continue your wellbeing journey</p>

              <form onSubmit={handleEmailLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm mb-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                    <label htmlFor="remember" className="ml-2 text-gray-600">Remember me</label>
                  </div>
                  <a href="#" className="font-medium text-teal-600 hover:text-teal-700">Forgot password?</a>
                </div>

                <button type="submit" className="w-full bg-[#1A936F] text-white font-bold py-3 px-4 rounded-full hover:bg-[#167d5e] transition-colors">
                  Log in
                </button>

                <button onClick={handleGoogleLogin} type="button" className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 font-bold py-3 px-4 rounded-full hover:bg-gray-50 transition-colors">
                  <GoogleIcon /> Continue with Google
                </button>
              </form>

              <div className="text-center text-sm text-gray-500 mt-8">
                New here? <a href="#" className="font-bold text-teal-600 hover:text-teal-700">Create an account</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

