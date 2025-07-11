import styles from './Header.module.css';
import logo from '../../assets/logo-hagi.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IoHomeOutline } from 'react-icons/io5';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
   const [menuOpen, setMenuOpen] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
   const { cartItems } = useCart();
   const { user, logout, loadingAuth } = useAuth();

   const isInCatalogOrProduct = location.pathname.startsWith('/catalog') || location.pathname.startsWith('/product');
   const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

   const handleSearchClick = () => {
      if (location.pathname.includes('catalog')) {
         const input = document.getElementById('searchInput');
         if (input) input.focus();
      } else {
         navigate('/catalog');
      }
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
                        <li><Link to="/catalog">Կատալոգ</Link></li>
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
                  <button className={styles.iconBtn} onClick={handleSearchClick}>🔍</button>

                  {isInCatalogOrProduct && (
                     <div className={styles.cartWrapper}>
                        <Link to="/cart" className={styles.iconBtn}>🛒</Link>
                        {totalItems > 0 && (
                           <span className={styles.cartCount}>{totalItems}</span>
                        )}
                     </div>
                  )}

                  {loadingAuth ? (
                     <div className={styles.loadingSpinner} aria-label="Loading user data"></div>
                  ) : user ? (
                     <div className={styles.userBox}>
                        <div className={styles.avatar} aria-label="User icon" role="img">🧑</div>
                        <span className={styles.email}>{user.email}</span>
                        <button className={styles.logoutBtn} onClick={logout}>Դուրս գալ</button>
                     </div>
                  ) : (
                     <Link to="/login" className={styles.iconBtn}>Մուտք</Link>
                  )}
               </div>
            </div>
         </header>

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
