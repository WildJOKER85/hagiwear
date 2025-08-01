import { useEffect, useState } from 'react';
import ProductCardEditable from '../ProductCardEditable/ProductCardEditable';
import styles from './ProductsTab.module.css';

const API_URL = 'http://localhost:10000/api/products';

const ProductsTab = () => {
   const [products, setProducts] = useState([]);

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

   const handleDeleteProduct = async (id) => {
      try {
         const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
         });
         if (response.ok) {
            setProducts(products.filter(p => p.id !== id));
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
               onDelete={handleDeleteProduct}
            />
         ))}
      </div>
   );
};

export default ProductsTab;
