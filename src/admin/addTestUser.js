// This script adds a user to Firestore manually.
// Usage: Import and call addTestUser() from a React component or run in a dev/test environment.

import { db, auth } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function addTestUser() {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be signed in to add yourself to Firestore.");
    return;
  }
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Test User",
    photoURL: user.photoURL || null,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: "active",
    emailVerified: user.emailVerified,
    provider: user.providerData[0]?.providerId || "email",
  });
}
