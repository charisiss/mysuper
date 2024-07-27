import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDittsUoLIyqJzyveiwjQYVkumIjW6diy4",
  authDomain: "mysuper-6e24c.firebaseapp.com",
  projectId: "mysuper-6e24c",
  storageBucket: "mysuper-6e24c.appspot.com",
  messagingSenderId: "136695518284",
  appId: "1:136695518284:web:f83e5c8d20e8f5c64310e9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
