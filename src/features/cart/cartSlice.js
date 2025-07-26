import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:10000/api';

export const fetchCartFromServer = createAsyncThunk(
   'cart/fetchCartFromServer',
   async (userId) => {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
      if (!response.ok) throw new Error('Ошибка загрузки корзины');
      const data = await response.json();
      console.log('[fetchCartFromServer] ответ от сервера:', data);
      return data;
   }
);

export const saveCartToServer = createAsyncThunk(
   'cart/saveCartToServer',
   async ({ userId, items }) => {
      const response = await fetch(`${API_BASE_URL}/cart/save`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId, items }),
      });
      if (!response.ok) throw new Error('Ошибка сохранения корзины');
      const data = await response.json();
      return data;
   }
);

const getCartFromLocalStorage = () => {
   try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
   } catch {
      return [];
   }
};

const saveCartToLocalStorage = (cart) => {
   try {
      localStorage.setItem('cart', JSON.stringify(cart));
   } catch { }
};

const initialState = {
   items: getCartFromLocalStorage(),
   status: 'idle',
   error: null,
};

const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers: {
      addToCart: (state, action) => {
         const item = action.payload;
         const existing = state.items.find((i) => i.id === item.id);
         if (existing) {
            existing.quantity += item.quantity || 1;
         } else {
            state.items.push({ ...item, quantity: item.quantity || 1 });
         }
         saveCartToLocalStorage(state.items);
      },
      removeFromCart: (state, action) => {
         const id = action.payload;
         state.items = state.items.filter((item) => item.id !== id);
         saveCartToLocalStorage(state.items);
      },
      clearCart: (state) => {
         state.items = [];
         saveCartToLocalStorage([]);
      },
      setCart: (state, action) => {
         state.items = action.payload;
         saveCartToLocalStorage(state.items);
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchCartFromServer.fulfilled, (state, action) => {
            const payload = action.payload;
            // если сервер возвращает { items: [...] }
            if (Array.isArray(payload.items)) {
               state.items = payload.items;
            } else if (Array.isArray(payload.cart)) {
               state.items = payload.cart;
            } else if (Array.isArray(payload)) {
               state.items = payload;
            } else {
               state.items = [];
            }
            saveCartToLocalStorage(state.items);
         })
         .addCase(saveCartToServer.fulfilled, (state) => {
            // опционально: изменить статус или показать уведомление
         });
   },
});

export const { addToCart, removeFromCart, clearCart, setCart } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalPrice = (state) => {
   let totalPrice = 0;
   state.cart.items.forEach(element => {
      totalPrice += element.price;
   });
   return totalPrice;
};
export default cartSlice.reducer;
