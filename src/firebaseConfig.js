import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA6JBKgsVMttqJmzJxQjx6OrsgH6LsOGLk",
  authDomain: "eaglepro-auction.firebaseapp.com",
  projectId: "eaglepro-auction",
  storageBucket: "eaglepro-auction.appspot.com",
  messagingSenderId: "874229776890",
  appId: "1:874229776890:web:a80055ac1b801c1f36e443",
  measurementId: "G-MNNZ2ZC7BW"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore(app)