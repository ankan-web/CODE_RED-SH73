import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

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
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, []);

  return { isAdmin, checking };
}
