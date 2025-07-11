import styles from './CheckoutPage.module.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { saveOrder } from '../services/firebase/orders';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Добавляем isSuccessModalOpen в зависимости, чтобы не уходить с /checkout пока модалка открыта
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    } else if (cartItems.length === 0 && !isSuccessModalOpen) {
      navigate('/catalog', { replace: true });
    }
  }, [user, cartItems, navigate, isSuccessModalOpen]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanCartItems = cartItems.map(item => {
      const numericPrice = parseInt(item.price.toString().replace(/[^\d]/g, ''));
      return {
        id: item.id,
        name: item.name,
        price: numericPrice,
        quantity: item.quantity,
        size: item.size || null,
      };
    });

    const orderData = {
      userId: user.uid,
      userEmail: user.email,
      items: cleanCartItems,
      paymentMethod,
      total: cleanCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    try {
      await saveOrder(orderData);
      setIsSuccessModalOpen(true);
      clearCart();
    } catch (error) {
      setError('⚠️ Պատվերը ձախողվեց, փորձեք կրկին։');
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsSuccessModalOpen(false);
    navigate('/catalog');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Ձևակերպել պատվեր</h2>

      <form onSubmit={handleOrder} className={styles.form} noValidate>
        <div className={styles.section}>
          <h3 className={styles.subtitle}>Ընտրեք վճարման եղանակը</h3>

          <label className={styles.label}>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              disabled={loading}
              className={styles.radio}
            />
            Կանխիկ վճարում առաքման պահին
          </label>

          <label className={`${styles.label} ${styles.disabledLabel}`} title="Շուտով հասանելի կլինի">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              disabled={true}
              className={styles.radio}
            />
            Վճարում քարտով (շուտով)
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Ուղարկվում է...' : 'Հաստատել պատվերը'}
        </button>
      </form>

      {isSuccessModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>🎉 Պատվերը հաջողությամբ կատարված է</h2>
            <p>Շնորհակալություն ձեր գնումների համար։</p>
            <button onClick={closeModal} className={styles.closeBtn}>
              Վերադառնալ կատալոգ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
