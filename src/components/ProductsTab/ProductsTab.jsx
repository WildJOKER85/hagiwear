import { useState, useEffect, useCallback } from 'react';
import ProductCardEditable from '../ProductCardEditable/ProductCardEditable';
import ProductsFilter from '../ProductsFilter/ProductsFilter';
import styles from './ProductsTab.module.css';

const API_URL = 'http://localhost:10000/api/products';

const ProductsTab = () => {
   const [products, setProducts] = useState([]);
   const [activeInnerTab, setActiveInnerTab] = useState('all');
   const [filters, setFilters] = useState({});
   const [productToDelete, setProductToDelete] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const categoryName = 'Նոր անուն, նոր խոսք, նոր ձև';

   const handleFilterChange = useCallback((newFilters) => {
      setFilters(newFilters);
   }, []);

   const cleanFilters = (filters) => {
      const result = {};
      for (const key in filters) {
         const value = filters[key];

         if (typeof value === 'string') {
            if (value.trim() !== '') {
               result[key] = value.trim();
            }
         } else if (typeof value === 'boolean') {
            if (value === true) {
               result[key] = value;
            }
         } else if (value !== null && value !== undefined) {
            result[key] = value;
         }
      }
      return result;
   };

   useEffect(() => {
      const fetchProducts = async () => {
         setLoading(true);
         setError(null);
         try {
            const filtered = cleanFilters(filters);
            const queryString = new URLSearchParams(filtered).toString();
            const response = await fetch(`${API_URL}?${queryString}`);

            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('data', data);
            // Поддержка структуры, в которой сервер присылает массив продуктов с вложенными цветами, размерами и остатками
            const parsedProducts = (Array.isArray(data) ? data : data.products || []).map(product => ({
               ...product,
               colors: product.colors || [],     // ожидается массив объектов: { id, name }
               sizes: product.sizes || [],       // ожидается массив объектов: { id, name }
               stock: product.stock || []        // ожидается массив объектов: { color_id, size_id, quantity }
            }));
            setProducts(parsedProducts);
            console.log(parsedProducts);
         } catch (err) {
            console.error('Error fetching products:', err);
            setError('Ошибка загрузки товаров');
            setProducts([]);
         } finally {
            setLoading(false);
         }
      };
      fetchProducts();
   }, [filters]);

   const confirmDeleteProduct = (id) => setProductToDelete(id);
   const handleCancelDelete = () => setProductToDelete(null);

   const handleConfirmDelete = async () => {
      try {
         const response = await fetch(`${API_URL}/${productToDelete}`, { method: 'DELETE' });
         if (response.ok) {
            setProducts(products.filter(p => p.id !== productToDelete));
            setProductToDelete(null);
         }
      } catch (error) {
         console.error('Error deleting product:', error);
      }
   };

   const handleSaveProduct = (updatedProduct) => {
      const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      setProducts(updated);
   };

   return (
      <div>
         {/* Вкладки */}
         <div className={styles.innerTabs}>
            <button
               className={activeInnerTab === 'all' ? styles.activeTab : ''}
               onClick={() => setActiveInnerTab('all')}
               type="button"
            >
               Բոլոր ապրանքները
            </button>
            <button
               className={activeInnerTab === 'filter' ? styles.activeTab : ''}
               onClick={() => setActiveInnerTab('filter')}
               type="button"
            >
               Ֆիլտր
            </button>
            {Object.keys(filters).length > 0 && !loading && (
               <p className={styles.filterApplied}>Ցուցադրված են ֆիլտրված արդյունքները</p>
            )}
         </div>

         <div className={styles.innerContent}>
            {activeInnerTab === 'filter' && (
               <div className={styles.filterPanel}>
                  <ProductsFilter onFilterChange={handleFilterChange} />
                  {loading && <p>Загрузка товаров...</p>}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {!loading && !error && products.length === 0 && (
                     <p>Нет товаров, соответствующих фильтру</p>
                  )}
                  {!loading && !error && products.length > 0 && (
                     <div className={styles.productsGrid}>
                        {products.map(product => (
                           <ProductCardEditable
                              key={product.id}
                              product={product}
                              onSave={handleSaveProduct}
                              onDelete={() => confirmDeleteProduct(product.id)}
                           />
                        ))}
                     </div>
                  )}
               </div>
            )}

            {activeInnerTab === 'all' && (
               <div className={styles.productsGrid}>
                  {products.map(product => (
                     <ProductCardEditable
                        key={product.id}
                        product={product}
                        onSave={handleSaveProduct}
                        onDelete={() => confirmDeleteProduct(product.id)}
                     />
                  ))}
               </div>
            )}
         </div>

         {activeInnerTab === 'all' && (
            <div className={styles.categorySubtitle}>
               {categoryName}
            </div>
         )}

         {productToDelete !== null && (
            <div className={styles.modalOverlay}>
               <div className={styles.modal}>
                  <p>Դուք վստահ եք, որ ցանկանում եք ջնջել այս ապրանքը՞</p>
                  <div className={styles.modalButtons}>
                     <button onClick={handleConfirmDelete} className={styles.button} type="button">Այո, ջնջել</button>
                     <button onClick={handleCancelDelete} className={styles.buttonCancel} type="button">Ոչ</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ProductsTab;
