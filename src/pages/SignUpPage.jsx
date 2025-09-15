import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Import updateProfile
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState(""); // <-- Add state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


      // After creating the user, update their profile with the name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // --- Write user info to Firestore 'users' collection ---
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: userCredential.user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: "active",
        emailVerified: userCredential.user.emailVerified,
        provider: userCredential.user.providerData[0]?.providerId || "email"
      });

      toast.success("Account created successfully!", { id: toastId });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message, { id: toastId });
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
            {/* --- New Input Field for Name --- */}
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
              />
            </div>
            {/* ----------------------------- */}

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
                placeholder="name@school.edu"
                disabled={isLoading}
              />
            </div>
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

