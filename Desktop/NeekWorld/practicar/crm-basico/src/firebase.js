import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA9HZI_RHaVHBO9U42YT8fdCUPUwX4tzEA",
    authDomain: "crm-basico.firebaseapp.com",
    projectId: "crm-basico",
    storageBucket: "crm-basico.appspot.com",
    messagingSenderId: "525428812842",
    appId: "1:525428812842:web:91e90e2f39aba807bb2753"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword };
