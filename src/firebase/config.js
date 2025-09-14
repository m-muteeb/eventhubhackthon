// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXhlt49nlOC_mMtBufo0Jco99u5JRBZQ8",
  authDomain: "saylani-hackthon-26245.firebaseapp.com",
  projectId: "saylani-hackthon-26245",
  storageBucket: "saylani-hackthon-26245.firebasestorage.app",
  messagingSenderId: "816654547848",
  appId: "1:816654547848:web:f741fba4acb9a0f403183d",
  measurementId: "G-30JZHGYQC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // Firestore instance
const storage = getStorage(app);

// Export Firebase services and functions
export {
  auth,
  db,
  storage,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  doc,
  setDoc,
  ref,
  uploadBytes,
  uploadBytesResumable
};
