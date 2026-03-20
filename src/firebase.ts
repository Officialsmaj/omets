import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_b2Pi-CvwfXLZFz0tGTx1UoHUajB1kPU",
  authDomain: "omets-25229.firebaseapp.com",
  projectId: "omets-25229",
  storageBucket: "omets-25229.firebasestorage.app",
  messagingSenderId: "784710492843",
  appId: "1:784710492843:web:6e677d46f8a7ba3c7dcdee",
  measurementId: "G-JVSYG9LH9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
