import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { auth, db } from "../firebase"; // Assuming firebase.js exports auth and db

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation for the name field
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Step 2: Update the user's profile in Firebase Authentication
      // This adds the 'displayName' to the user object, which is good practice.
      await updateProfile(user, {
        displayName: name,
      });

      // Step 3: Create the user's document in the 'users' collection in Firestore
      // This is the crucial step for your Admin Panel to see the user.
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: user.photoURL, // This will be null initially
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: "active", // Default status for new users
      }, { merge: true }); // Using { merge: true } is a best practice

      toast.success("Account created successfully!", { id: toastId });
      navigate("/dashboard"); // Redirect user after successful signup

    } catch (error) {
      // Provide a more user-friendly error message
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      }
      console.error("Signup Error:", error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F0FAFA] min-h-screen font-sans text-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
          <p className="text-gray-500 mb-8">
            Start your journey with MindEase
          </p>

          <form onSubmit={handleSignup}>
            {/* Full Name Input */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
                required
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A936F] text-white font-bold py-3 px-4 rounded-full hover:bg-[#167d5e] transition-colors disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
