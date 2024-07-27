"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onLogin?: (user: User | null) => void; // Add onLogin to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onLogin?: (user: User | null) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onLogin,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (onLogin) {
        onLogin(user);
      }
    });

    return () => unsubscribe();
  }, [onLogin]);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, setLoading, onLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
