import { useCart } from '../context/CartContext';
import styles from './CartPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPromptModal from '../components/common/LoginPromptModal/LoginPromptModal';

const CartPage = () => {
   const { cartItems, updateQuantity, removeFromCart } = useCart();
   const { user } = useAuth();
   const navigate = useNavigate();
   const [showLoginModal, setShowLoginModal] = useState(false);

   // Подсчет общей суммы
   const totalPrice = cartItems.reduce((sum, item) => {
      const priceNumber = Number(item.price.toString().replace(/[^\d]/g, ''));
      return sum + priceNumber * item.quantity;
   }, 0);

   const handleBuyNowClick = () => {
      if (!user) {
         setShowLoginModal(true);
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
               <div key={item.id} className={styles.item}>
                  <img src={item.images?.[0]} alt={item.name} />
                  <div className={styles.info}>
                     <h3>{item.name}</h3>
                     <p>Գին՝ {item.price}</p>

                     <div className={styles.controls}>
                        <button
                           onClick={() => {
                              if (item.quantity > 1) {
                                 updateQuantity(item.id, item.quantity - 1);
                              }
                           }}
                        >
                           −
                        </button>

                        <span>{item.quantity}</span>

                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                           +
                        </button>
                     </div>

                     <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id)}
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
            <button
               className={styles.buyNowBtn}
               onClick={handleBuyNowClick}
            >
               🛒 Գնել հիմա
            </button>
         </div>

         <LoginPromptModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
         />
      </div>
   );
};

export default CartPage;
