import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCardEditable from '../ProductCardEditable/ProductCardEditable';
import ProductsFilter from '../ProductsFilter/ProductsFilter';
import styles from './ProductsTab.module.css';

const API_URL = 'http://localhost:10000/api/products';

const ProductsTab = () => {
   const [allProducts, setAllProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [productToDelete, setProductToDelete] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const [pendingFilters, setPendingFilters] = useState({});
   const [appliedFilters, setAppliedFilters] = useState({});

   const [searchParams, setSearchParams] = useSearchParams();
   const initialTab = searchParams.get('tab') || 'all';
   const initialProductId = searchParams.get('productId') || null;

   const [originTab, setOriginTab] = useState(null);
   const [activeInnerTab, setActiveInnerTab] = useState(initialTab);
   const [selectedProductId, setSelectedProductId] = useState(
      initialProductId ? Number(initialProductId) : null
   );

   const categoryName = 'Նոր անուն, նոր խոսք, նոր ձև';

   // === helpers ===
   const cleanFilters = (obj) =>
      Object.fromEntries(
         Object.entries(obj || {}).filter(([, v]) => {
            if (v === undefined || v === null) return false;
            const s = String(v).trim();
            return s !== '' && s.toLowerCase() !== 'all';
         })
      );

   const hasNonEmptyFilters = (obj) =>
      Object.values(obj || {}).some((v) => {
         if (v === undefined || v === null) return false;
         const s = String(v).trim();
         return s !== '' && s.toLowerCase() !== 'all';
      });

   // === Синхронизация с URL (tab/productId) ===
   useEffect(() => {
      const tabFromUrl = searchParams.get('tab');
      const productIdFromUrl = searchParams.get('productId');

      if (tabFromUrl && tabFromUrl !== activeInnerTab) {
         setActiveInnerTab(tabFromUrl);
      }
      if (productIdFromUrl && Number(productIdFromUrl) !== selectedProductId) {
         setSelectedProductId(Number(productIdFromUrl));
      }
   }, [searchParams, activeInnerTab, selectedProductId]);

   // === Инициализация фильтров из URL (если есть) ===
   useEffect(() => {
      const tabFromUrl = searchParams.get('tab');
      const entries = Object.fromEntries(searchParams.entries());
      delete entries.tab;
      delete entries.productId;

      const urlFilters = cleanFilters(entries);
      if (tabFromUrl === 'filter') {
         setPendingFilters(urlFilters);
         setAppliedFilters(urlFilters);
      }
   }, [searchParams]);

   // === Обновление фильтров ===
   const handleFilterChange = useCallback((newFilters) => {
      setPendingFilters(newFilters);
   }, []);

   const handleTabChange = (tab) => {
      setActiveInnerTab(tab);

      if (tab === 'all') {
         setAppliedFilters({});
         setPendingFilters({});
         setFilteredProducts([]);
      }
      setSearchParams({ tab });
   };

   const applyFilters = () => {
      const cleaned = cleanFilters(pendingFilters);
      setAppliedFilters(cleaned);
      setSearchParams({ ...cleaned, tab: 'filter' });
   };

   const clearFilters = () => {
      setPendingFilters({});
      setAppliedFilters({});
      setFilteredProducts([]);
      setSearchParams({ tab: 'filter' });
   };

   // === Загрузка всех товаров (один раз) ===
   useEffect(() => {
      const fetchAllProducts = async () => {
         setLoading(true);
         setError(null);
         try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const parsed = (Array.isArray(data) ? data : data.products || []).map((product) => ({
               ...product,
               colors: product.colors || [],
               sizes: product.sizes || [],
               stock: product.stock || [],
               main_image: product.main_image || null,
               thumb1: product.thumb1 || null,
               thumb2: product.thumb2 || null,
            }));
            setAllProducts(parsed);
         } catch (err) {
            console.error('Error fetching all products:', err);
            setError('Ошибка загрузки товаров');
            setAllProducts([]);
         } finally {
            setLoading(false);
         }
      };
      fetchAllProducts();
   }, []);

   // === Загрузка отфильтрованных товаров ===
   useEffect(() => {
      const actuallyHasFilters = hasNonEmptyFilters(appliedFilters);
      if (!actuallyHasFilters) {
         setFilteredProducts([]);
         return;
      }

      const fetchFiltered = async () => {
         setLoading(true);
         setError(null);
         try {
            const queryString = new URLSearchParams(appliedFilters).toString();
            const response = await fetch(`${API_URL}?${queryString}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const parsed = (Array.isArray(data) ? data : data.products || []).map((product) => ({
               ...product,
               colors: product.colors || [],
               sizes: product.sizes || [],
               stock: product.stock || [],
               main_image: product.main_image || null,
               thumb1: product.thumb1 || null,
               thumb2: product.thumb2 || null,
            }));
            setFilteredProducts(parsed);
         } catch (err) {
            console.error('Error fetching filtered products:', err);
            setError('Ошибка загрузки товаров');
            setFilteredProducts([]);
         } finally {
            setLoading(false);
         }
      };

      fetchFiltered();
   }, [appliedFilters]);

   // === Удаление продукта ===
   const confirmDeleteProduct = (id) => setProductToDelete(id);
   const handleCancelDelete = () => setProductToDelete(null);
   const handleConfirmDelete = async () => {
      try {
         const response = await fetch(`${API_URL}/${productToDelete}`, { method: 'DELETE' });
         if (response.ok) {
            setAllProducts((prev) => prev.filter((p) => p.id !== productToDelete));
            setFilteredProducts((prev) => prev.filter((p) => p.id !== productToDelete));
            setProductToDelete(null);
         }
      } catch (error) {
         console.error('Error deleting product:', error);
      }
   };

   // === Сохранение продукта ===
   const handleSaveProduct = async (productId, formData) => {
      try {
         const data = new FormData();
         data.append('name', formData.name);
         data.append('description', formData.description);
         data.append('price', formData.price);
         data.append('discount', formData.discount);
         data.append('color_id', formData.color);
         data.append('size_id', formData.size);
         data.append('quantity', formData.stock);

         if (formData.mainImageFile) data.append('mainImageFile', formData.mainImageFile);
         if (formData.thumb1File) data.append('thumb1File', formData.thumb1File);
         if (formData.thumb2File) data.append('thumb2File', formData.thumb2File);

         data.append('mainImageDeleted', formData.mainImageDeleted);
         data.append('thumb1Deleted', formData.thumb1Deleted);
         data.append('thumb2Deleted', formData.thumb2Deleted);

         const response = await fetch(productId ? `${API_URL}/${productId}` : API_URL, {
            method: productId ? 'PUT' : 'POST',
            body: data,
         });

         if (!response.ok) throw new Error('Ошибка при сохранении');

         const updatedProduct = await response.json();

         if (productId) {
            setAllProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p)));
            setFilteredProducts((prev) =>
               prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p))
            );
         } else {
            setAllProducts((prev) => [...prev, updatedProduct]);
         }

         // Возвращаем пользователя на исходную вкладку
         const returnTab = originTab || 'all';
         setActiveInnerTab(returnTab);
         setSearchParams({ tab: returnTab });
         setOriginTab(null); // очищаем

         return updatedProduct;
      } catch (error) {
         console.error('❌ [handleSaveProduct] Ошибка:', error);
         alert('Ошибка при сохранении продукта');
      }
   };

   // === Просмотр 
   const handleViewProduct = (id) => {
      setOriginTab(activeInnerTab); // сохраняем откуда пришли
      setActiveInnerTab('view');
      setSelectedProductId(id);
      setSearchParams({ tab: 'view', productId: id });
   };

   // Редактирование товара ===
   const handleEditProduct = (id) => {
      setOriginTab(activeInnerTab); // сохраняем откуда пришли
      setActiveInnerTab('edit');
      setSelectedProductId(id);
      setSearchParams({ tab: 'edit', productId: id });
   };

   // --- Определяем какие товары отображать ---
   const actuallyHasFilters = hasNonEmptyFilters(appliedFilters);
   let visibleProducts = [];
   if (activeInnerTab === 'all') {
      visibleProducts = allProducts;
   } else if (activeInnerTab === 'filter') {
      visibleProducts = actuallyHasFilters ? filteredProducts : allProducts;
   } else if ((activeInnerTab === 'view' || activeInnerTab === 'edit') && selectedProductId) {
      visibleProducts = allProducts.filter((p) => p.id === selectedProductId);
   }

   return (
      <div>
         <div className={styles.innerTabs}>
            <button
               className={activeInnerTab === 'all' ? styles.activeTab : ''}
               onClick={() => handleTabChange('all')}
               type="button"
            >
               Բոլոր ապրանքները
            </button>
            <button
               className={activeInnerTab === 'filter' ? styles.activeTab : ''}
               onClick={() => handleTabChange('filter')}
               type="button"
            >
               Ֆիլտր
            </button>
         </div>

         {activeInnerTab === 'filter' && actuallyHasFilters && (
            <div className={styles.filterNotice}>Ցուցադրված են ֆիլտրված ապրանքներ</div>
         )}

         <div className={styles.mainContainer}>
            {activeInnerTab === 'filter' && (
               <div className={styles.filtersColumn}>
                  <ProductsFilter pendingFilters={pendingFilters} onFilterChange={handleFilterChange} />
                  <div className={styles.buttonsRow}>
                     <button type="button" onClick={applyFilters}>
                        Որոնել
                     </button>
                     <button type="button" onClick={clearFilters}>
                        Ջնջել
                     </button>
                  </div>
               </div>
            )}

            <div
               className={
                  activeInnerTab === 'all'
                     ? styles.productsColumn
                     : activeInnerTab === 'filter'
                        ? styles.filterProductsColumn
                        : undefined
               }
            >
               {loading && <p>Загрузка товаров...</p>}
               {error && <p style={{ color: 'red' }}>{error}</p>}
               {!loading && !error && visibleProducts.length === 0 && <p>Ապրանքներ չկան</p>}
               {!loading &&
                  !error &&
                  visibleProducts.length > 0 &&
                  visibleProducts.map((product) => (
                     <ProductCardEditable
                        key={`${product.id}-${product.main_image}-${product.thumb1}-${product.thumb2}`}
                        product={product}
                        onSave={handleSaveProduct}
                        onDelete={() => confirmDeleteProduct(product.id)}
                        onView={() => handleViewProduct(product.id)}
                        onEdit={() => handleEditProduct(product.id)}
                     />
                  ))}
            </div>
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
