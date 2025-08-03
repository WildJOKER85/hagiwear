import { useEffect, useState } from 'react';
import ProductCardEditable from '../ProductCardEditable/ProductCardEditable';
import styles from './ProductsTab.module.css';

const API_URL = 'http://localhost:10000/api/products';

const ProductsTab = () => {
   const [products, setProducts] = useState([]);
   const [productToDelete, setProductToDelete] = useState(null);

   const fetchProducts = async () => {
      try {
         const response = await fetch(API_URL);
         const data = await response.json();
         setProducts(data);
      } catch (error) {
         console.error('Error fetching products:', error);
      }
   };

   useEffect(() => {
      fetchProducts();
   }, []);

   const handleUpdateProduct = async (id, updatedData) => {
      try {
         const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
         });
         if (response.ok) {
            fetchProducts();
         }
      } catch (error) {
         console.error('Error updating product:', error);
      }
   };

   const confirmDeleteProduct = (id) => {
      setProductToDelete(id);
   };

   const handleCancelDelete = () => {
      setProductToDelete(null);
   };

   const handleConfirmDelete = async () => {
      try {
         const response = await fetch(`${API_URL}/${productToDelete}`, {
            method: 'DELETE'
         });
         if (response.ok) {
            setProducts(products.filter(p => p.id !== productToDelete));
            setProductToDelete(null);
         }
      } catch (error) {
         console.error('Error deleting product:', error);
      }
   };

   return (
      <div className={styles.wrapper}>
         {products.map((product) => (
            <ProductCardEditable
               key={product.id}
               product={product}
               onSave={handleUpdateProduct}
               onDelete={() => confirmDeleteProduct(product.id)}
            />
         ))}

         {productToDelete !== null && (
            <div className={styles.modalOverlay}>
               <div className={styles.modal}>
                  <p>Դուք վստահ եք, որ ցանկանում եք ջնջել այս ապրանքը՞</p>
                  <div className={styles.modalButtons}>
                     <button onClick={handleConfirmDelete} className={styles.button}>Այո, ջնջել</button>
                     <button onClick={handleCancelDelete} className={styles.buttonCancel}>Ոչ</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ProductsTab;
