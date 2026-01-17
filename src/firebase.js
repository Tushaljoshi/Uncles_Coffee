// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcrk7xejrjN6PIYZJlTPRcudK100OJQyM",
  authDomain: "swap-street-ebccb.firebaseapp.com",
  databaseURL: "https://swap-street-ebccb-default-rtdb.firebaseio.com",
  projectId: "swap-street-ebccb",
  storageBucket: "swap-street-ebccb.firebasestorage.app",
  messagingSenderId: "377981017774",
  appId: "1:377981017774:web:a81dec4ca82f2d1023973f",
  measurementId: "G-4GRM4DRLJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Export Firestore database and Realtime Database for use in other components
export { db, realtimeDb };
export default app;