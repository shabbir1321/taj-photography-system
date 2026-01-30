import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMZj5-Mcf1T_RPrHsUh-rR14UIzC6mZdo",
  authDomain: "taj-system.firebaseapp.com",
  projectId: "taj-system",
  storageBucket: "taj-system.firebasestorage.app",
  messagingSenderId: "340314073143",
  appId: "1:340314073143:web:ca4fbaaa6e65882538f7b2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
