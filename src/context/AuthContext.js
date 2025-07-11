import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config'; // твоя инициализация Firebase Auth
import {
   signInWithEmailAndPassword,
   createUserWithEmailAndPassword,
   signOut,
   onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true); // важный флаг загрузки

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, currentUser => {
         setUser(currentUser);
         setLoading(false);
      });
      return unsubscribe;
   }, []);

   const login = (email, password) =>
      signInWithEmailAndPassword(auth, email, password);

   const register = (email, password) =>
      createUserWithEmailAndPassword(auth, email, password);

   const logout = () =>
      signOut(auth);

   return (
      <AuthContext.Provider value={{ user, loading, login, register, logout }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
