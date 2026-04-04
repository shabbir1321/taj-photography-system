import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

const LOGO_MAPPING = {
  "admin@taj.com": "taj.png",
  "studio@mustafa.com": "mustafa.png",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // ⚠️ undefined, NOT null
  const [profile, setProfile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // If in demo mode, don't listen to real auth changes
    if (isDemoMode) return;
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      // 💡 Prevent resetting if we are currently logged in as a hardcoded Master Admin
      if (user?.uid === "admin-master") return;

      if (currentUser) {
        // Fetch specific photographer profile
        const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
        let profileData = null;

        if (profileDoc.exists()) {
          profileData = profileDoc.data();
          // Apply local mapping override/fallback
          const localLogo = LOGO_MAPPING[currentUser.email];
          if (localLogo) {
            profileData.logoUrl = `/logos/${localLogo}`;
          }
        } else {
          // Default profile shell
          profileData = {
            studioName: "Studio-Portal",
            email: currentUser.email,
            status: currentUser.email === "admin@studio.com" ? "active" : "pending",
            isAdmin: currentUser.email === "admin@studio.com",
            businessDetails: "Indore, MP",
            logoUrl: LOGO_MAPPING[currentUser.email] ? `/logos/${LOGO_MAPPING[currentUser.email]}` : null,
            createdAt: serverTimestamp()
          };
          
          // 💡 Auto-register the missing profile in Firestore
          await setDoc(doc(db, "profiles", currentUser.uid), profileData);
        }

        // 💡 Master Admin Check (Centralized Power)
        if (currentUser.email === "admin@studio.com") {
          profileData.isAdmin = true;
          profileData.status = "active";
        }

        // 💡 Legacy Approved User (Normal Photographer)
        if (currentUser.email === "admin@taj.com" || currentUser.email === "studio@mustafa.com") {
          const wasPending = profileData.status === "pending";
          profileData.isAdmin = false;
          profileData.status = "active";
          
          // If they were pending in DB, update them to active
          if (wasPending && !isDemoMode) {
            import("firebase/firestore").then(({ updateDoc, doc }) => {
                updateDoc(doc(db, "profiles", currentUser.uid), { status: "active" });
            });
          }
        }

        setUser(currentUser);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, [isDemoMode]);

  const loginAsDemo = () => {
    setIsDemoMode(true);
    setUser({ uid: "demo-user", email: "demo@photographer.com" });
    setProfile({ studioName: "Demo Photography Studio", businessDetails: "Indore, MP\n+91 9999999999", logoUrl: null });
  };

  const loginWithEmail = async (email, password) => {
    // 💡 Master Admin Smart-Login / Activation
    if (email === "admin@studio.com" && password === "admin123") {
      try {
        // Try real login first
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch (err) {
        // If account doesn't exist in Firebase Auth yet, ACTIVATE it now
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          const res = await createUserWithEmailAndPassword(auth, "admin@studio.com", "admin123");
          const adminProfile = {
            studioName: "Studio-Portal Admin",
            email: "admin@studio.com",
            status: "active",
            isAdmin: true,
            businessDetails: "System Administrator",
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "profiles", res.user.uid), adminProfile);
          return true;
        }
        throw err;
      }
    }

    // Standard Firebase Auth for Photographers
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const signUp = async (email, password, studioName) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile = {
        studioName,
        email,
        status: "pending",
        isAdmin: false,
        businessDetails: "Waiting for Admin verification...",
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "profiles", res.user.uid), newProfile);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const setupAdmin = async () => {
    try {
      // 💡 This creates the real admin@studio.com account in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, "admin@studio.com", "admin123");
      const adminProfile = {
        studioName: "Studio-Portal Admin",
        email: "admin@studio.com",
        status: "active",
        isAdmin: true,
        businessDetails: "System Administrator",
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "profiles", res.user.uid), adminProfile);
      return true;
    } catch (err) {
      // If user already exists, just return true
      if (err.code === "auth/email-already-in-use") return true;
      throw err;
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      setProfile(null);
    } else {
      await signOut(auth);
    }
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  // ⏳ Wait until Firebase resolves auth
  if (user === undefined) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0E0E0E'
      }}>
        <div className="spinner"></div> 
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading: user === undefined, isDemoMode, loginAsDemo, loginWithEmail, signUp, setupAdmin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
