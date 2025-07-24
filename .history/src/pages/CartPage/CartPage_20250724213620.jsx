import styles from './CartPage.module.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { updateQuantityOnServer, removeFromCartOnServer } from '../../features/cart/cartAPI';


const CartPage = () => {
   const [user, setUser] = useState(null); // получи пользователя по своей логике
   const [cartItems, setCartItems] = useState([]);
   const [stockStatus, setStockStatus] = useState([]);
   const navigate = useNavigate();

   useEffect(() => {
      const storedUser = null; // или from localStorage / context
      setUser(storedUser);

      const loadCart = async () => {
         if (storedUser) {
            try {
               const res = await fetch(`http://localhost:10000/api/cart/${storedUser.id}`);
               const data = await res.json();
               setCartItems(data);
               await checkStock(data);
            } catch {
               setCartItems([]);
            }
         } else {
            const storedCart = localStorage.getItem('cart');
            const cart = storedCart ? JSON.parse(storedCart) : [];
            setCartItems(cart);
            await checkStock(cart);
         }
      };

      const checkStock = async (items) => {
         try {
            const res = await fetch('http://localhost:10000/api/cart/check-stock', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ items }),
            });
            const data = await res.json();
            setStockStatus(data.items);
         } catch (error) {
            console.error('Ошибка проверки остатков:', error);
         }
      };

      loadCart();
   }, []);

   const isOutOfStock = (productId, size) => {
      const item = stockStatus.find(i => i.productId === productId && i.size === size);
      return item && !item.isAvailable;
   };

   const updateQuantity = (productId, size, newQty) => {
      if (user) {
         // логика обновления на сервере (добавь сам)
      } else {
         const updated = cartItems.map(item =>
            item.productId === productId && item.size === size ? { ...item, quantity: newQty } : item);
         setCartItems(updated);
         localStorage.setItem('cart', JSON.stringify(updated));
      }
   };

   const removeFromCart = (productId, size) => {
      if (user) {
         // логика удаления на сервере (добавь сам)
      } else {
         const updated = cartItems.filter(item => !(item.productId === productId && item.size === size));
         setCartItems(updated);
         localStorage.setItem('cart', JSON.stringify(updated));
      }
   };

   const totalPrice = cartItems.reduce((sum, item) => {
      const priceNumber = Number(item.price.toString().replace(/[^\d]/g, ''));
      return sum + priceNumber * item.quantity;
   }, 0);

   const handleBuyNowClick = () => {
      if (!user) {
         navigate('/login');
      } else {
         navigate('/checkout');
      }
   };

   if (cartItems.length === 0) {
      return (
         <div className={styles.wrapper}>
            <h2>Ձեր զամբյուղը դատարկ է 😕</h2>
            <Link to="/catalog" className={styles.backBtn}>
               🔙 Վերադառնալ կատալոգ
            </Link>
         </div>
      );
   }

   return (
      <div className={styles.wrapper}>
         <h2>Ձեր զամբյուղը</h2>

         <div className={styles.items}>
            {cartItems.map((item) => (
               <div key={`${item.productId}-${item.size}`} className={styles.item}>
                  <img
                     src={item.images?.[0] || item.main_image || '/placeholder.png'}
                     alt={item.name}
                  />
                  <div className={styles.info}>
                     <h3>{item.name}</h3>
                     <p>Չափս՝ {item.size}</p>
                     <p>Գին՝ {item.price} ֏</p>

                     {isOutOfStock(item.productId, item.size) ? (
                        <p className={styles.outOfStock}>Այս ապրանքը առկա չէ</p>
                     ) : (
                        <div className={styles.controls}>
                           <button
                              onClick={() => {
                                 if (item.quantity > 1) {
                                    updateQuantity(item.productId, item.size, item.quantity - 1);
                                 }
                              }}
                           >
                              −
                           </button>

                           <span>{item.quantity}</span>

                           <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>
                              +
                           </button>
                        </div>
                     )}

                     <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.productId, item.size)}
                     >
                        🗑 Հեռացնել ամբողջությամբ
                     </button>
                  </div>
               </div>
            ))}

         </div>

         <div className={styles.total}>
            Ընդհանուր գումարը՝ {totalPrice.toLocaleString()} ֏
         </div>

         <div className={styles.actions}>
            <Link to="/catalog" className={styles.backBtn}>
               ⬅ Շարունակել գնումները
            </Link>
            <button className={styles.buyNowBtn} onClick={handleBuyNowClick}>
               🛒 Գնել հիմա
            </button>
         </div>
      </div>
   );
};

export default CartPage;
