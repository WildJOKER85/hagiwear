import styles from './CatalogPage.module.css';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';

const API_URL = `${window.location.protocol}//${window.location.hostname}:10000/api/products`;

const CatalogPage = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const inputRef = useRef(null);
   const category = searchParams.get('category');
   const search = searchParams.get('search')?.trim().toLowerCase() || '';
   const [searchInput, setSearchInput] = useState(search);

   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`Սերվերի սխալ: ${res.status}`);
            const data = await res.json();
            setProducts(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   useEffect(() => {
      if (inputRef.current) {
         inputRef.current.focus();
      }
   }, []);

   const filtered = products.filter(p => {
      const matchesCategory = category ? p.category === category : true;
      const matchesSearch = search ? p.name.toLowerCase().includes(search) : true;
      return matchesCategory && matchesSearch;
   });

   const getTitle = () => {
      if (category === 'men') return 'Տղամարդկանց հավաքածու';
      if (category === 'women') return 'Կանանց հավաքածու';
      return 'Նոր անուն, նոր խոսք, նոր ձև';
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const query = {};
      if (category) query.category = category;
      if (searchInput.trim()) query.search = searchInput.trim();
      setSearchParams(query);
   };

   const clearSearch = () => {
      setSearchInput('');
      const query = {};
      if (category) query.category = category;
      setSearchParams(query);
   };

   return (
      <section className={styles.catalog}>
         <h1 className={styles.pageTitle}>{getTitle()}</h1>

         <form className={styles.searchForm} onSubmit={handleSubmit}>
            <input
               type="text"
               ref={inputRef}
               value={searchInput}
               onChange={e => setSearchInput(e.target.value)}
               placeholder="Որոնել ապրանքի անվանումով..."
               className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Որոնել</button>
            {search && (
               <button type="button" onClick={clearSearch} className={styles.clearBtn}>✕</button>
            )}
         </form>

         {search && (
            <p className={styles.resultText}>
               Որոնման արդյունքներ՝ <strong>"{search}"</strong>
            </p>
         )}

         {loading ? (
            <p>Բեռնվում է...</p>
         ) : error ? (
            <p className={styles.noResults}>Սխալ՝ {error}</p>
         ) : (
            <div className={styles.grid}>
               {filtered.length > 0 ? (
                  filtered.map((item) => (
                     <ProductCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        image={item.main_image || '/default-image.png'}
                        stock={item.stock}
                        description={item.description}
                     />
                  ))
               ) : (
                  <p className={styles.noResults}>Արդյունքներ չկան։</p>
               )}
            </div>
         )}
      </section>
   );
};

export default CatalogPage;
