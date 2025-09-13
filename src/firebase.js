// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Add this import

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdYbvGbLcWaLRXn26bQ-CRnHXEIqBfAXo",
  authDomain: "mindease-final-sih.firebaseapp.com",
  projectId: "mindease-final-sih",
  storageBucket: "mindease-final-sih.firebasestorage.app",
  messagingSenderId: "85516995115",
  appId: "1:85516995115:web:9038aa908af446b9a5b86e",
  measurementId: "G-6M32MPXT16",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get the Auth service and export it
export const auth = getAuth(app);

// Initialize Firestore and export it
export const db = getFirestore(app); // Add this line

// Export app so you can use Firebase in other files
export default app;
