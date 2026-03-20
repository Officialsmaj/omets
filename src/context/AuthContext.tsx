import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, firstName: string, lastName: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else if (firebaseUser.providerData[0]?.providerId === 'google.com') {
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'officialsmaj@gmail.com' ? 'admin' : 'user',
              verified: true, // Google users are pre-verified
              omtBalance: 100, // Welcome bonus
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const registerWithEmail = async (email: string, pass: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: `${firstName} ${lastName}`,
      photoURL: null,
      role: 'user',
      verified: false,
      omtBalance: 100, // Welcome bonus
    };

    // Store user with verification code
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        verificationCode: code,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }

    // Send verification email via backend
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error('Backend unavailable');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert(`Backend unavailable (GitHub Pages mode). Your verification code is: ${code}`);
    }

    setUser(newUser);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      setUser(userDoc.data() as User);
    }
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().verificationCode === code) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          verified: true,
          verificationCode: null, // Clear code after verification
        });
        setUser(prev => prev ? { ...prev, verified: true } : null);
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
    return false;
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, registerWithEmail, signInWithEmail, verifyCode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
