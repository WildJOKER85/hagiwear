import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMYgsbHkEAaGn0R06Va2h7gO1ETjKLR6M",
  authDomain: "hagiwear.firebaseapp.com",
  projectId: "hagiwear",
  storageBucket: "hagiwear.appspot.com",
  messagingSenderId: "163722703367",
  appId: "1:163722703367:web:f7cc89703c7756916530a2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);



