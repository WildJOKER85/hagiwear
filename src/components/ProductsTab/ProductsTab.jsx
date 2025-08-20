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

   const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);

   const cleanFilters = (filters) => {
      const result = {};
      for (const key in filters) {
         const value = filters[key];
         if (typeof value === 'string' && value.trim() !== '') result[key] = value.trim();
         else if (typeof value === 'boolean' && value) result[key] = value;
         else if (value !== null && value !== undefined) result[key] = value;
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
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const parsedProducts = (Array.isArray(data) ? data : data.products || []).map(product => ({
               ...product,
               colors: product.colors || [],
               sizes: product.sizes || [],
               stock: product.stock || [],
               main_image: product.main_image || null,
               thumb1: product.thumb1 || null,
               thumb2: product.thumb2 || null,
            }));
            console.log('📦 Fetched products:', parsedProducts);
            setProducts(parsedProducts);
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
            setProducts(prev => prev.filter(p => p.id !== productToDelete));
            setProductToDelete(null);
         }
      } catch (error) {
         console.error('Error deleting product:', error);
      }
   };

   const handleSaveProduct = async (productId, formData) => {
      try {
         const data = new FormData();
         data.append("name", formData.name);
         data.append("description", formData.description);
         data.append("price", formData.price);
         data.append("discount", formData.discount);

         if (formData.mainImageFile) data.append("mainImageFile", formData.mainImageFile);
         if (formData.thumb1File) data.append("thumb1File", formData.thumb1File);
         if (formData.thumb2File) data.append("thumb2File", formData.thumb2File);

         data.append("mainImageDeleted", formData.mainImageDeleted);
         data.append("thumb1Deleted", formData.thumb1Deleted);
         data.append("thumb2Deleted", formData.thumb2Deleted);

         // 🔍 Логируем FormData подробно
         console.log(`💾 [handleSaveProduct] Отправка данных для product ${productId || "NEW"}`);
         for (let [key, value] of data.entries()) {
            if (value instanceof File) {
               console.log("   📂", key, "=", value.name, `(size: ${value.size} bytes)`);
            } else {
               console.log("   📝", key, "=", value);
            }
         }

         const response = await fetch(
            productId ? `${API_URL}/${productId}` : API_URL,
            {
               method: productId ? "PUT" : "POST",
               body: data,
            }
         );

         console.log("📡 [handleSaveProduct] Ответ статус:", response.status);

         if (!response.ok) throw new Error("Ошибка при сохранении");

         const updatedProduct = await response.json();
         console.log("✅ [handleSaveProduct] Обновлённый продукт от сервера:", updatedProduct);

         // 🔹 Авто-обновление списка продуктов
         setProducts(prev => {
            if (productId) {
               return prev.map(p => (p.id === productId ? { ...p, ...updatedProduct } : p));
            } else {
               return [...prev, updatedProduct];
            }
         });

         return updatedProduct;
      } catch (error) {
         console.error("❌ [handleSaveProduct] Ошибка:", error);
         alert("Ошибка при сохранении продукта");
      }
   };

   return (
      <div>
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
            {(activeInnerTab === 'filter' || activeInnerTab === 'all') && (
               <div className={activeInnerTab === 'filter' ? styles.filterPanel : styles.productsGrid}>
                  {activeInnerTab === 'filter' && <ProductsFilter onFilterChange={handleFilterChange} />}
                  {loading && <p>Загрузка товаров...</p>}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {!loading && !error && products.length === 0 && <p>Ապրանքներ չկան</p>}
                  {!loading && !error && products.length > 0 && (
                     <div className={styles.productsGrid}>
                        {products.map(product => (
                           <ProductCardEditable
                              key={`${product.id}-${product.main_image}-${product.thumb1}-${product.thumb2}`}
                              product={product}
                              onSave={handleSaveProduct}
                              onDelete={() => confirmDeleteProduct(product.id)}
                           />
                        ))}
                     </div>
                  )}
               </div>
            )}
         </div>

         {activeInnerTab === 'all' && <div className={styles.categorySubtitle}>{categoryName}</div>}

         {productToDelete !== null && (
            <div className={styles.modalOverlay}>
               <div className={styles.modal}>
                  <p>Դուք վստահ եք, որ ցանկանում եք ջնջել այս ապրանքը՞</p>
                  <div className={styles.modalButtons}>
                     <button onClick={handleConfirmDelete} className={styles.button} type="button">
                        Այո, ջնջել
                     </button>
                     <button onClick={handleCancelDelete} className={styles.buttonCancel} type="button">
                        Ոչ
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ProductsTab;
