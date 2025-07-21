import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import menImg from '../../assets/category-men.jpg';
import womenImg from '../../assets/category-women.jpg';

const HomePage = () => {
   return (
      <>
         <section className={styles.home}>
            <div className={styles.hero}>
               <h1>HAGIWEAR</h1>
               <p>Նոր անուն, նոր խոսք, նոր ձև</p>
               <div className={styles.heroButtons}>
                  <Link to="/catalog" className={styles.ctaBtn}>
                     Դիտել հավաքածուն
                  </Link>
                  <Link to="/catalog?category=saryan" className={styles.secondaryBtn}>
                     Սարյանի հավաքածու →
                  </Link>
               </div>
            </div>
         </section>

         <section className={styles.categories}>
            <div className={styles.category}>
               <img src={menImg} alt="Men" loading="lazy" />
               <Link to="/catalog?category=men" className={styles.categoryBtn}>MEN</Link>
            </div>
            <div className={styles.category}>
               <img src={womenImg} alt="Women" loading="lazy" />
               <Link to="/catalog?category=women" className={styles.categoryBtn}>WOMEN</Link>
            </div>
         </section>
      </>
   );
};

export default HomePage;