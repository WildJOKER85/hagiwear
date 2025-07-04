import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IoHomeOutline } from 'react-icons/io5';
import styles from './Header.module.css';
import logo from '../../assets/logo-hagi.png';

const Header = () => {
   const [menuOpen, setMenuOpen] = useState(false);

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

                  <button
                     className={styles.burgerBtn}
                     onClick={() => setMenuOpen(true)}
                  >
                     ☰
                  </button>
               </div>

               <div className={styles.logoWrapper}>
                  <img src={logo} alt="Hagi Logo" className={styles.logo} loading='lazy' />
               </div>

               <div className={styles.right}>
                  <button className={styles.iconBtn}>🔍</button>
                  <button className={styles.iconBtn}>🛒</button>
                  <button className={styles.iconBtn}>Մուտք</button>
               </div>
            </div>
         </header>

         {/* Мобильное меню */}
         {menuOpen && (
            <div className={styles.mobileMenu}>
               <button
                  className={styles.closeBtn}
                  onClick={() => setMenuOpen(false)}
               >
                  ✕
               </button>
               <ul className={styles.mobileMenuList}>
                  <li>
                     <Link to="/" onClick={() => setMenuOpen(false)}>
                        <IoHomeOutline size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Գլխավոր
                     </Link>
                  </li>
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
