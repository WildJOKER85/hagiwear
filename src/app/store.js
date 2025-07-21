import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
   reducer: {
      auth: authReducer,
      cart: cartReducer,
   },
});

// Сохраняем корзину в localStorage при каждом изменении
store.subscribe(() => {
   const cart = store.getState().cart.items;
   localStorage.setItem('cart', JSON.stringify(cart));
});


