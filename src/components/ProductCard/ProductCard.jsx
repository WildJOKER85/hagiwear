import styles from './ProductCard.module.css';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, image, stock, description }) => {
   const isUnavailable = stock <= 0;

   return (
      <div className={`${styles.card} ${isUnavailable ? styles.unavailable : ''}`}>
         <Link to={`/product/${id}`} className={styles.imageWrapper}>
            <img src={image} alt={name} className={styles.image} />
            {isUnavailable && <div className={styles.outOfStock}>Առկա չէ</div>}
         </Link>
         <div className={styles.details}>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.price}>{isUnavailable ? 'Առկա չէ' : price}</p>
            <p className={styles.description}>{description}</p>
            {!isUnavailable && (
               <Link to={`/product/${id}`} className={styles.detailsBtn}>
                  Տեսնել մանրամասն
               </Link>
            )}
         </div>
      </div>
   );
};

export default ProductCard;

