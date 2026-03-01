// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyByz7oWokfjwrP0hM4ZywJP99N_K0nVGYk",
    authDomain: "securitysim-132bb.firebaseapp.com",
    projectId: "securitysim-132bb",
    storageBucket: "securitysim-132bb.firebasestorage.app",
    messagingSenderId: "672754157617",
    appId: "1:672754157617:web:48ea5ef6e0fcad6c336d10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
