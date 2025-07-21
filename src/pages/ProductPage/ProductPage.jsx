import styles from './ProductPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const BASE_URL = 'http://localhost:10000';

const ProductPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const user = useSelector(state => state.auth.user);

   const [product, setProduct] = useState(null);
   const [images, setImages] = useState([]);
   const [selectedImage, setSelectedImage] = useState('');
   const [quantity, setQuantity] = useState(1);
   const [selectedSize, setSelectedSize] = useState(null);
   const [addedToCart, setAddedToCart] = useState(false);
   const [isZoomed, setIsZoomed] = useState(false);

   useEffect(() => {
      async function fetchProduct() {
         try {
            const res = await fetch(`${BASE_URL}/api/products/${id}`);
            if (!res.ok) throw new Error('Ապրանքը չի գտնվել');
            const data = await res.json();
            setProduct(data);
            setSelectedSize(null);
            setQuantity(1);
         } catch (err) {
            console.error(err);
            setProduct(null);
         }
      }

      fetchProduct();
   }, [id]);

   useEffect(() => {
      if (!product) return;

      async function fetchImages() {
         try {
            const res = await fetch(`${BASE_URL}/api/product-images/${product.id}/images`);
            if (!res.ok) throw new Error('Նկարները չեն բեռնվել');
            const imgs = await res.json();
            const urls = imgs.map(img => img.image_url);
            setImages(urls);
            setSelectedImage(urls[0] || '');
         } catch (err) {
            console.error(err);
            setImages([]);
            setSelectedImage('');
         }
      }

      fetchImages();
   }, [product]);

   if (product === null) return <p className={styles.notFound}>Ապրանքը չի գտնվել։</p>;

   const isOutOfStock = selectedSize ? (product.sizes?.[selectedSize] ?? 0) <= 0 : false;

   const handleAddToCart = async () => {
      if (!selectedSize) {
         alert('Խնդրում ենք ընտրել չափսը։');
         return;
      }

      if (user) {
         try {
            await fetch(`${BASE_URL}/api/cart`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  userId: user.id,
                  productId: product.id,
                  quantity,
                  size: selectedSize
               })
            });
         } catch (err) {
            console.error('Error adding to cart:', err);
         }
      } else {
         const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
         const index = existingCart.findIndex(
            item => item.productId === product.id && item.size === selectedSize
         );

         if (index >= 0) {
            existingCart[index].quantity += quantity;
         } else {
            existingCart.push({
               productId: product.id,
               name: product.name,
               price: product.price,
               images: [selectedImage],
               size: selectedSize,
               quantity
            });
         }

         localStorage.setItem('cart', JSON.stringify(existingCart));
      }

      alert(`Ավելացվեց զամբյուղ: ${product.name}, չափս՝ ${selectedSize}, քանակ՝ ${quantity}`);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
   };

   return (
      <div className={styles.wrapper}>
         <button className={styles.backBtn} onClick={() => navigate(-1)}>← Վերադառնալ</button>

         <div className={styles.container}>
            <div className={styles.imageSection}>
               <div className={styles.bigPhoto}>
                  {selectedImage ? (
                     <img
                        src={selectedImage}
                        alt={product.name}
                        className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
                        onClick={() => setIsZoomed(z => !z)}
                        style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                     />
                  ) : (
                     <p>Բեռնվում է պատկեր...</p>
                  )}
               </div>

               <div className={styles.thumbnailRow}>
                  {images.map((img, idx) => (
                     <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`${styles.thumb} ${selectedImage === img ? styles.activeThumb : ''}`}
                        onClick={() => setSelectedImage(img)}
                     />
                  ))}
               </div>
            </div>

            <div className={styles.info}>
               <h1>{product.name}</h1>
               <p className={styles.price}>{product.price} ֏</p>
               <p className={styles.description}>{product.description}</p>

               <div className={styles.sizeRow}>
                  <div className={styles.sizeSelector}>
                     {product.sizes && Object.entries(product.sizes).map(([size, stock]) => (
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
                           <p>Չափսը՝ {selectedSize}</p>
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
