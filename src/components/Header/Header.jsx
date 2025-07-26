import styles from './Header.module.css';
import logo from '../../assets/logo-hagi.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IoHomeOutline } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../../features/cart/cartSlice';
import { selectUser, selectIsLoggedIn, logout } from '../../features/auth/authSlice';
import Modal from '../Modal/Modal';

const Header = () => {
   const cartItems = useSelector(selectCartItems);
   const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
   const [menuOpen, setMenuOpen] = useState(false);
   const [showLogoutModal, setShowLogoutModal] = useState(false);
   const [logoutMessage, setLogoutMessage] = useState('');
   const location = useLocation();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const user = useSelector(selectUser);
   const isLoggedIn = useSelector(selectIsLoggedIn);

   const handleSearchClick = () => {
      if (location.pathname.includes('catalog')) {
         const input = document.getElementById('searchInput');
         if (input) input.focus();
      } else {
         navigate('/catalog');
      }
   };

   const handleLogoutClick = () => {
      if (totalItems > 0) {
         setLogoutMessage('Ձեր զամբյուղում առկա են ապրանքներ։ Դուք ուզում եք դուրս գալ և զամբյուղը մաքրել?');
      } else {
         setLogoutMessage('Դուք իսկապես ուզում եք դուրս գալ?');
      }
      setShowLogoutModal(true);
   };

   const confirmLogout = () => {
      setShowLogoutModal(false);
      dispatch(logout());
      dispatch(clearCart());
      localStorage.removeItem('cart');
      localStorage.removeItem('userEmail');
      navigate('/');
   };

   const cancelLogout = () => {
      setShowLogoutModal(false);
   };

   return (
      <>
         <header className={styles.header}>
            <div className={styles.container}>
               <div className={styles.left}>
                  <nav className={styles.nav}>
                     <ul className={styles.menuList}>
                        <li>
                           <Link to="/">
                              <IoHomeOutline size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                              Գլխավոր
                           </Link>
                        </li>
                        <li><Link to="/catalog">Տեսականի</Link></li>
                        <li><Link to="/about">Մեր մասին</Link></li>
                        <li><Link to="/contacts">Կապ</Link></li>
                     </ul>
                  </nav>
                  <button className={styles.burgerBtn} onClick={() => setMenuOpen(true)}>☰</button>
               </div>

               <div className={styles.logoWrapper}>
                  <img src={logo} alt="Hagi Logo" className={styles.logo} loading="lazy" />
               </div>

               <div className={styles.right}>
                  <button className={styles.iconBtn} onClick={handleSearchClick} aria-label="Search">
                     <FiSearch size={20} />
                  </button>

                  {/* Показываем корзину всегда */}
                  <div className={styles.cartWrapper}>
                     <Link to="/cart" className={styles.iconBtn} aria-label="Cart">🛒</Link>
                     {totalItems > 0 && (
                        <span className={styles.cartCount}>{totalItems}</span>
                     )}
                  </div>

                  {!isLoggedIn ? (
                     <Link to="/login" className={styles.iconBtn}>Մուտք</Link>
                  ) : (
                     <div className={styles.userBox}>
                        <span className={styles.email}>{user.email}</span>
                        <button onClick={handleLogoutClick} className={styles.logoutBtn}>Ելք</button>
                     </div>
                  )}
               </div>
            </div>
         </header>

         <Modal
            isOpen={showLogoutModal}
            title="Ելքի հաստատում"
            message={logoutMessage}
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
         />

         {menuOpen && (
            <div className={styles.mobileMenu}>
               <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>✕</button>
               <ul className={styles.mobileMenuList}>
                  <li><Link to="/" onClick={() => setMenuOpen(false)}>Գլխավոր</Link></li>
                  <li><Link to="/catalog" onClick={() => setMenuOpen(false)}>Կատալոգ</Link></li>
                  <li><Link to="/about" onClick={() => setMenuOpen(false)}>Մեր մասին</Link></li>
                  <li><Link to="/contacts" onClick={() => setMenuOpen(false)}>Կապ</Link></li>
               </ul>
            </div>
         )}
      </>
   );
};

export default Header;
