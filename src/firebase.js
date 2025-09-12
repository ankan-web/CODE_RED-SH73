// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrWWt5OsoQKiVamVIfAIHymLPTdGf38yc",
  authDomain: "mindease-9d1d0.firebaseapp.com",
  projectId: "mindease-9d1d0",
  storageBucket: "mindease-9d1d0.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "209981198698",
  appId: "1:209981198698:web:1ba5d854ba88c033eb9513",
  measurementId: "G-RG15FEPB6V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get the Auth service and export it
export const auth = getAuth(app);

// Export app so you can use Firebase in other files
export default app;
