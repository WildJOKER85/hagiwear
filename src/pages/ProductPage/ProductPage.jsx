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

   // Парсим размеры, если они строкой
   const parsedSizes = (() => {
      if (!product?.sizes) return {};
      if (typeof product.sizes === 'string') {
         // Пример: "XS:5;S:2;M:0"
         // или "XS,S,M" — тут надо знать формат, если через запятую, тогда сделать так:
         // const arr = product.sizes.split(',');
         // return arr.reduce((acc, size) => ({ ...acc, [size.trim()]: 10 }), {}); // например stock=10 по умолчанию
         // Но лучше уточни формат на бекенде.
         try {
            // Если строка в формате JSON
            return JSON.parse(product.sizes);
         } catch {
            // Если просто через запятую — считаем все в наличии по 10 шт.
            const arr = product.sizes.split(',').map(s => s.trim()).filter(Boolean);
            const obj = {};
            arr.forEach(s => (obj[s] = 10));
            return obj;
         }
      }
      // Если уже объект
      return product.sizes;
   })();

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
            console.log(urls, 'urls');
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

   const discount = product.discount || 0;
   const discountedPrice =
      discount > 0 ? Math.round(product.price * (1 - discount / 100)) : product.price;

   const isOutOfStock = selectedSize ? (parsedSizes[selectedSize] ?? 0) <= 0 : false;

   const handleAddToCart = async () => {
      if (!selectedSize) {
         alert('Խնդրում ենք ընտրել չափսը։');
         return;
      }

      if (user) {
         try {
            const res = await fetch(`${BASE_URL}/api/cart`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  userId: user.id,
                  productId: product.id,
                  quantity,
                  size: selectedSize,
               }),
            });
            if (!res.ok) throw new Error('Չհաջողվեց ավելացնել զամբյուղ');
         } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Սխալ՝ չի հաջողվում ավելացնել զամբյուղ');
            return;
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
               quantity,
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
         <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Վերադառնալ
         </button>

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
                  {images
                     .slice(1, 3) // пропускаем главное, показываем только доп. 1 и доп. 2
                     .filter(Boolean)
                     .map((img, idx) => (
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

               <div className={styles.priceWrapper}>
                  {discount > 0 ? (
                     <>
                        <span className={styles.oldPrice}>{product.price.toLocaleString()} ֏</span>
                        <span className={styles.discountedPrice}>{discountedPrice.toLocaleString()} ֏</span>
                        <span className={styles.discountBadge}>- {discount}%</span>
                     </>
                  ) : (
                     <span className={styles.price}>{product.price.toLocaleString()} ֏</span>
                  )}
               </div>

               <p className={styles.description}>{product.description}</p>

               <div className={styles.sizeRow}>
                  <div className={styles.sizeSelector}>
                     {Object.entries(parsedSizes).map(([size, stock]) => (
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
                           <p>
                              Վիճակ՝{' '}
                              <strong>
                                 {parsedSizes[selectedSize] > 0 ? 'Առկա է' : 'Առկա չէ'}
                              </strong>
                           </p>
                           <button onClick={() => setSelectedSize(null)} className={styles.clearBtn}>
                              Ջնջել ընտրությունը
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {selectedSize && (
                  <p className={styles.stock}>
                     Վիճակ՝{' '}
                     <strong>
                        {isOutOfStock
                           ? 'Առկա չէ'
                           : `Առկա է (${parsedSizes[selectedSize]} հատ)`}
                     </strong>
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

         {addedToCart && <div className={styles.cartNotification}>✅ Ավելացված է զամբյուղ</div>}
      </div>
   );
};

export default ProductPage;
