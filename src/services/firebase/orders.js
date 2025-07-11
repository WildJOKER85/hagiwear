// src/services/firebase/orders.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../firebase/config';

export const saveOrder = async (orderData) => {
   try {
      const cleanedItems = orderData.items.map(item => {
         const cleaned = { ...item };
         if (cleaned.size == null) delete cleaned.size;
         return cleaned;
      });

      const docRef = await addDoc(collection(db, "orders"), {
         ...orderData,
         items: cleanedItems,
         createdAt: serverTimestamp()
      });

      return docRef;
   } catch (error) {
      console.error("🔥 Error saving order:", error.message);
      throw error;
   }
};


