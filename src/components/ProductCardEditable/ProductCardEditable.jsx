import { useState } from 'react';
import { FaPen, FaTimes } from 'react-icons/fa';
import styles from './ProductCardEditable.module.css';

const ProductCardEditable = ({ product, onSave, onDelete }) => {
   const [mode, setMode] = useState('collapsed'); // collapsed | expanded | edit

   const baseUrl = 'http://localhost:10000/images/products/';
   const imageSrc = product.main_image
      ? (product.main_image.startsWith('http')
         ? product.main_image
         : baseUrl + product.main_image)
      : null;

   const handleCancel = () => {
      setMode('collapsed');
   };

   const handleSave = (updatedData) => {
      onSave(product.id, updatedData);
      setMode('collapsed');
   };

   const priceWithDiscount = product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

   const renderPrice = (
      <p>
         {product.discount > 0 ? (
            <>
               <span className={styles.oldPrice}>{product.price} ֏</span>
               <span className={styles.newPrice}>{priceWithDiscount} ֏</span>
            </>
         ) : (
            `${product.price} ֏`
         )}
      </p>
   );

   if (mode === 'edit') {
      return (
         <ProductCardEditable
            product={product}
            onSave={handleSave}
            onCancel={handleCancel}
         />
      );
   }

   if (mode === 'expanded') {
      return (
         <div className={styles.card}>
            <img
               src={imageSrc}
               alt={product.name}
               className={styles.image}
            />
            <div className={styles.info}>
               <h4>{product.name}</h4>
               <p>{product.description}</p>
               {renderPrice}
               <p>Զեղչ: {product.discount}%</p>
               <p>Քանակ: {product.stock}</p>
               <p>Գույն: {product.colors}</p>
               <p>Չափս: {product.sizes}</p>
            </div>
            <div className={styles.actions}>
               <button onClick={() => setMode('edit')} title="Խմբագրել"><FaPen /></button>
               <button onClick={handleCancel} title="Փակել"><FaTimes /></button>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.card}>
         <img
            src={imageSrc}
            alt={product.name}
            className={styles.image}
         />
         <div className={styles.info}>
            <h4>{product.name}</h4>
            {renderPrice}
         </div>
         <div className={styles.actions}>
            <button onClick={() => setMode('expanded')} title="Դիտել"><FaPen /></button>
            <button onClick={() => onDelete(product.id)} title="Ջնջել"><FaTimes /></button>
         </div>
      </div>
   );
};

export default ProductCardEditable;
