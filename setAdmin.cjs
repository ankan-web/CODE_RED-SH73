// setAdmin.js
const admin = require("firebase-admin");

// load your service account key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// paste the UID you copied from Firebase Authentication → Users
const uid = "swt1mRAiBhYnZCIMfc68vqEmXmi1";

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for user ${uid}`);
    process.exit();
  })
  .catch((error) => {
    console.error("❌ Error setting admin claim:", error);
    process.exit(1);
  });


  import { useState, useEffect } from "react";
  import { useAuthState } from "react-firebase-hooks/auth";
  import { auth } from "../firebase";

  export function useAdmin() {
    const [user, authLoading] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAdminClaim = async () => {
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Force a token refresh to get the latest claims.
        const idTokenResult = await user.getIdTokenResult(true);

        // Check if the custom 'admin' claim is true.
        if (idTokenResult.claims.admin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      };

      if (!authLoading) {
        checkAdminClaim();
      }
    }, [user, authLoading]);

    return { isAdmin, loading };
  }

