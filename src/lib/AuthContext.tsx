import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure persistence is set to local at initialization
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence failed:", err));

    // Check for redirect result on load
    getRedirectResult(auth).catch(err => {
      if (err.code === 'auth/unauthorized-domain') {
        console.error("Redirect: Domain not authorized");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Special bypass for the main partner
        if (user.email === "brandhoramkt@gmail.com") {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            setIsAdmin(adminDoc.exists());
          } catch (e) {
            console.error("Admin check failed:", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async (method: 'popup' | 'redirect' = 'popup') => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account'
      });
      
      if (method === 'popup') {
        console.log("Starting Firebase login popup...");
        await signInWithPopup(auth, provider);
      } else {
        console.log("Starting Firebase login redirect...");
        await signInWithRedirect(auth, provider);
      }
    } catch (err: any) {
      console.error("Full Firebase Error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("🚨 VENTANA BLOQUEADA: Abre el app en una PESTAÑA NUEVA (icono arriba a la derecha) o usa el método de REDIRECCIÓN.");
      } else if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`❌ DOMINIO NO AUTORIZADO: Debes añadir "${domain}" en la Consola de Firebase -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed it normally or it auto-closed
        alert("⚠️ La ventana se cerró antes de terminar. Si se cierra sola, prueba 'Entrar con Redirección' o abre el app en una pestaña nueva.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        alert("Error de Firebase: " + (err.message || "Prueba con Redirección o pestaña nueva."));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
