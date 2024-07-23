import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATgRl0PpOah6M247G4wXukxisbuS8SVuI",
  authDomain: "sistema-gestion-79d5b.firebaseapp.com",
  projectId: "sistema-gestion-79d5b",
  storageBucket: "sistema-gestion-79d5b.appspot.com",
  messagingSenderId: "704989396974",
  appId: "1:704989396974:web:718016e1e099c7877918ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
