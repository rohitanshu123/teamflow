// import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
// import type { ReactNode } from 'react'
// import type { Role, User } from '../types'
// import { SEED_USERS } from '../data/seed'
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "../firebase";

// /**
//  * Mock authentication for the demo. The shape (signIn/signOut/currentUser)
//  * deliberately mirrors a Firebase Auth wrapper so it can be swapped for the
//  * real SDK later by filling keys into .env — no UI changes needed.
//  * No external calls or API keys are used here.
//  */

// interface AuthContextValue {
//   currentUser: User | null
//   loading: boolean
//   signIn: (email: string) => { ok: boolean; error?: string }
//   signInAs: (role: Role) => void
//   signOut: () => void
// }

// const AUTH_KEY = 'teamflow.auth.v1'

// const AuthContext = createContext<AuthContextValue | null>(null)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [currentUser, setCurrentUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (user) {
//       setCurrentUser({
//         id: user.uid,
//         email: user.email || "",
//         name: user.displayName || "User",
//         role: "MEMBER",
//       } as User);
//     } else {
//       setCurrentUser(null);
//     }

//     setLoading(false);
//   });

//   return unsubscribe;
// }, []);
//   const persist = useCallback((user: User | null) => {
//     setCurrentUser(user)
//     try {
//       if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
//       else localStorage.removeItem(AUTH_KEY)
//     } catch {
//       /* ignore */
//     }
//   }, [])

//   const signIn = useCallback(
//     (email: string) => {
//       const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
//       if (!user) return { ok: false, error: 'No demo account with that email. Try a quick-login button below.' }
//       persist(user)
//       return { ok: true }
//     },
//     [persist],
//   )

//   const signInAs = useCallback(
//     (role: Role) => {
//       const user = SEED_USERS.find((u) => u.role === role)
//       if (user) persist(user)
//     },
//     [persist],
//   )

// const logout = useCallback(async () => {
//   await signOut(auth);
//   setCurrentUser(null);
// }, []);


//   const value = useMemo<AuthContextValue>(
//     () => ({
//   currentUser,
//   loading,
//   signIn,
//   signInAs,
//   signOut: logout,
// }),
//     [currentUser, loading, signIn, signInAs, signOut],
//   )

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export function useAuth(): AuthContextValue {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider')
//   return ctx
// }


import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../types";

import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { auth } from "../firebase";

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name:
              firebaseUser.displayName ||
              firebaseUser.email ||
              "User",
            role: "MEMBER",
          } as User);
        } else {
          setCurrentUser(null);
        }

        setLoading(false);
      });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signOut,
    }),
    [currentUser, loading, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}