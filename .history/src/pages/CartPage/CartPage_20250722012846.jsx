import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CartPage.module.css';

const CartPage = () => {
   const [user, setUser] = useState(null); // получи пользователя по своей логике
   const [cartItems, setCartItems] = useState([]);
   const navigate = useNavigate();

   useEffect(() => {
      // Загрузка user (пример)
      // Заменить на реальную логику получения пользователя
      const storedUser = null; // или from localStorage / context
      setUser(storedUser);

      if (storedUser) {
         // fetch корзины с сервера
         fetch(`http://localhost:10000/api/cart/${storedUser.id}`)
            .then(res => res.json())
            .then(data => setCartItems(data))
            .catch(() => setCartItems([]));
      } else {
         // корзина из localStorage
         const storedCart = localStorage.getItem('cart');
         setCartItems(storedCart ? JSON.parse(storedCart) : []);
      }
   }, []);

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
         // Например, отправляем на страницу логина
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
