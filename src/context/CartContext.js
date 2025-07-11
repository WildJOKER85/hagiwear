import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
   const [cartItems, setCartItems] = useState([]);

   const addToCart = (product, quantity = 1) => {
      setCartItems(prev => {
         const existing = prev.find(item => item.id === product.id);
         if (existing) {
            return prev.map(item =>
               item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
            );
         } else {
            return [...prev, { ...product, quantity }];
         }
      });
   };

   const updateQuantity = (id, newQty) => {
      if (newQty <= 0) {
         removeFromCart(id);
      } else {
         setCartItems(prev =>
            prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
         );
      }
   };

   const removeFromCart = (id) => {
      setCartItems(prev => prev.filter(item => item.id !== id));
   };

   // Добавлена функция очистки корзины
   const clearCart = () => {
      setCartItems([]);
   };

   const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

   return (
      <CartContext.Provider value={{
         cartItems,
         addToCart,
         updateQuantity,
         removeFromCart,
         clearCart,
         totalCount
      }}>
         {children}
      </CartContext.Provider>
   );
};
