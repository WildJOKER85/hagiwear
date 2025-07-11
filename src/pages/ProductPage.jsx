import styles from './ProductPage.module.css';
import products from '../data/products';

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const product = products[Number(id)];
   const { addToCart } = useCart();

   const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
   const [quantity, setQuantity] = useState(1);
   const [selectedSize, setSelectedSize] = useState(null);
   const [addedToCart, setAddedToCart] = useState(false);
   const [isZoomed, setIsZoomed] = useState(false);

   if (!product) return <p className={styles.notFound}>Ապրանքը չի գտնվել։</p>;

   const isOutOfStock = selectedSize ? product.sizes[selectedSize] <= 0 : false;

   const handleAddToCart = () => {
      setAddedToCart(true);
      addToCart(product, quantity);
      setTimeout(() => setAddedToCart(false), 2500);
   };

   return (
      <div className={styles.wrapper}>
         <button className={styles.backBtn} onClick={() => navigate(-1)}>← Վերադառնալ</button>

         <div className={styles.container}>
            <div className={styles.imageSection}>
               <div className={styles.bigPhoto}>
                  <img
                     src={selectedImage}
                     alt={product.name}
                     className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
                     onClick={() => setIsZoomed(z => !z)}
                     style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                  />
               </div>
               <div className={styles.thumbnailRow}>
                  {product.images.map((img, idx) => (
                     <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className={`${styles.thumb} ${selectedImage === img ? styles.activeThumb : ''}`}
                        onClick={() => setSelectedImage(img)}
                     />
                  ))}
               </div>
            </div>

            <div className={styles.info}>
               <h1>{product.name}</h1>
               <p className={styles.price}>{product.price}</p>
               <p className={styles.description}>{product.description}</p>

               <div className={styles.sizeRow}>
                  <div className={styles.sizeSelector}>
                     {Object.entries(product.sizes).map(([size, stock]) => (
                        <button
                           key={size}
                           className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                           disabled={stock <= 0}
                           onClick={() => setSelectedSize(size)}
                        >
                           {size}
                        </button>
                     ))}
                  </div>

                  <div className={styles.sizeInfo}>
                     {selectedSize && (
                        <>
                           <p>Ճափսը՝ {selectedSize}</p>
                           <p>Վիճակ՝ <strong>{product.sizes[selectedSize] > 0 ? 'Առկա է' : 'Առկա չէ'}</strong></p>
                           <button onClick={() => setSelectedSize(null)} className={styles.clearBtn}>
                              Ջնջել ընտրությունը
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {selectedSize && (
                  <p className={styles.stock}>
                     Վիճակ՝ <strong>{isOutOfStock ? 'Առկա չէ' : `Առկա է (${product.sizes[selectedSize]} հատ)`}</strong>
                  </p>
               )}

               {!isOutOfStock && (
                  <>
                     <div className={styles.quantity}>
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)}>+</button>
                     </div>

                     <button className={styles.addToCart} onClick={handleAddToCart}>
                        Ավելացնել զամբյուղ
                     </button>
                  </>
               )}

            </div>
         </div>

         {addedToCart && (
            <div className={styles.cartNotification}>✅ Ավելացված է զամբյուղ</div>
         )}
      </div>
   );
};

export default ProductPage;
