import { initializeApp } from "firebase/app";

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBGMX2_dUgkLFZbsKsg3YGv54rb0USJMUU",
  authDomain: "canvas-app-f118b.firebaseapp.com",
  projectId: "canvas-app-f118b",
  storageBucket: "canvas-app-f118b.firebasestorage.app",
  messagingSenderId: "635439535049",
  appId: "1:635439535049:web:271f350466f7bd0a04ce18"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db , app};