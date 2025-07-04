import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductPage.module.css';
import products from '../data/products';
import { useState } from 'react';

const ProductPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const product = products[Number(id)];

   const [quantity, setQuantity] = useState(1);
   const [selectedSize, setSelectedSize] = useState(null);
   const [stockStatus, setStockStatus] = useState(null);
   const [isZoomed, setIsZoomed] = useState(false);
   const [addedToCart, setAddedToCart] = useState(false);

   const handleAddToCart = () => {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
   };

   if (!product) return <p style={{ color: 'white' }}>Ապրանքը չի գտնվել։</p>;

   return (
      <div className={styles.wrapper}>
         <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Վերադառնալ
         </button>

         <div className={styles.container}>
            <div className={styles.imageWrapper}>
               <img
                  src={product.image}
                  alt={product.name}
                  className={`${styles.image} ${isZoomed ? styles.zoomed : ''}`}
                  onClick={() => setIsZoomed(z => !z)}
                  style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
               />
            </div>

            <div className={styles.info}>
               <h1>{product.name}</h1>
               <p className={styles.price}>{product.price}</p>
               <p className={styles.description}>{product.description}</p>

               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Ճափս</th>
                        <th>Թիկունք</th>
                        <th>Գոտկատեղ</th>
                        <th>Երկարություն</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr><td>XS</td><td>44</td><td>46</td><td>66</td></tr>
                     <tr><td>S</td><td>46</td><td>49</td><td>68</td></tr>
                     <tr><td>M</td><td>48</td><td>51</td><td>74</td></tr>
                     <tr><td>L</td><td>53</td><td>56</td><td>74</td></tr>
                     <tr><td>XL</td><td>56</td><td>58</td><td>76</td></tr>
                     <tr><td>XXL</td><td>57</td><td>62</td><td>78</td></tr>
                  </tbody>
               </table>

               <div className={styles.sizeRow}>
                  <div className={styles.sizeSelector}>
                     {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <button
                           key={size}
                           className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                           onClick={() => {
                              setSelectedSize(size);
                              setStockStatus(size === 'M' ? 'Առկա չէ' : 'Առկա է');
                           }}
                        >
                           {size}
                        </button>
                     ))}
                  </div>
                  <div className={styles.sizeInfo}>
                     {selectedSize && (
                        <>
                           <p>Ճափսը՝ {selectedSize}</p>
                           <p>Վիճակ՝ <strong>{stockStatus}</strong></p>
                           <button onClick={() => {
                              setSelectedSize(null);
                              setStockStatus(null);
                           }} className={styles.clearBtn}>
                              Ջնջել ընտրությունը
                           </button>
                        </>
                     )}
                  </div>
               </div>

               <div className={styles.quantity}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}>+</button>
               </div>

               <button className={styles.addToCart} onClick={handleAddToCart}>
                  Ավելացնել զամբյուղ
               </button>
            </div>
         </div>

         {addedToCart && (
            <div className={styles.cartNotification}>
               ✅ Ավելացված է զամբյուղ
            </div>
         )}
      </div >
   );
};

export default ProductPage;
