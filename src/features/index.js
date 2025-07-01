import cartReducer from './cart/cartSlice';
import productReducer from './products/productSlice';

export const rootReducer = {
    cart: cartReducer,
    products: productReducer,
};