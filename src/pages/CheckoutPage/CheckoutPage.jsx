import styles from './CheckoutPage.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearCart,
  selectCartItems,
  selectCartTotalPrice,
} from '../../features/cart/cartSlice';

const formatPrice = (num) =>
  num.toLocaleString('hy-AM', { minimumFractionDigits: 0 }) + ' ֏';

const CheckoutPage = () => {
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !isSuccessModalOpen) {
      navigate('/catalog', { replace: true });
    }
  }, [cartItems, navigate, isSuccessModalOpen]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccessModalOpen(true);
      dispatch(clearCart());
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

      <div className={styles.items}>
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.size}`} className={styles.item}>
            <img src={item.image} alt={item.name} className={styles.image} />
            <div className={styles.details}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.size}>Չափս: {item.size}</p>
              <p className={styles.quantity}>Քանակ: {item.quantity}</p>
              <p className={styles.price}>Գին: {item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.total}>
        Ընդհանուր գումար՝ <strong>{formatPrice(totalPrice)}</strong>
      </div>

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

          <label
            className={`${styles.label} ${styles.disabledLabel}`}
            title="Շուտով հասանելի կլինի"
          >
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
