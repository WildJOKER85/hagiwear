import styles from './ProductCard.module.css';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, oldPrice, discount, image, stock, description }) => {
   const isUnavailable = stock <= 0;

   return (
      <div className={`${styles.card} ${isUnavailable ? styles.unavailable : ''}`}>
         <Link to={`/product/${id}`} className={styles.imageWrapper}>
            <img src={image} alt={name} className={styles.image} />
            {discount > 0 && (
               <div className={styles.discountBadge}>- {discount}%</div>
            )}
            {isUnavailable && (
               <div className={styles.outOfStock}>Առկա չէ</div>
            )}
         </Link>

         <div className={styles.details}>
            <h3 className={styles.name}>{name}</h3>

            <div className={styles.priceBlock}>
               {oldPrice ? (
                  <>
                     <span className={styles.oldPrice}>{oldPrice.toLocaleString()} ֏</span>
                     <span className={styles.newPrice}>{price.toLocaleString()} ֏</span>
                  </>
               ) : (
                  <span className={styles.newPrice}>{price.toLocaleString()} ֏</span>
               )}
            </div>

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
