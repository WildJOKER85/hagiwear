import styles from './CatalogPage.module.css';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import p1 from '../assets/product-1.jpeg';
import p2 from '../assets/product-2.jpeg';
import p3 from '../assets/product-3.jpeg';
import p4 from '../assets/product-4.jpeg';
import p5 from '../assets/product-5.jpeg';
import p6 from '../assets/product-6.jpeg';
import p7 from '../assets/product-7.jpeg';
import p8 from '../assets/product-8.jpeg';
import p9 from '../assets/product-9.jpeg';
import p10 from '../assets/product-10.jpeg';

const products = [
   { name: 'Շապիկ «Ազդեցիկ» Սպիտակ', category: 'men', description: 'Սպիտակ շապիկ՝ մաքուր ձևավորմամբ։', price: '9 900 ֏', available: true, image: p1 },
   { name: 'Շապիկ «Ազդեցիկ» Սև', category: 'men', description: 'Սև տարբերակ՝ ուժեղ ոճով։', price: '9 900 ֏', available: true, image: p2 },
   { name: 'Շապիկ «Սրամիտ» Սև', category: 'men', description: 'Հումորով շապիկ։', price: '9 900 ֏', available: false, image: p3 },
   { name: 'Շապիկ «Սրամիտ» Սև', category: 'women', description: 'Սրամտությամբ շապիկ։', price: '9 900 ֏', available: true, image: p4 },
   { name: 'Շապիկ «Ոճային» Սպիտակ', category: 'women', description: 'Ժամանակակից տարբերակ։', price: '9 900 ֏', available: true, image: p5 },
   { name: 'Շապիկ «Ոճային» Սպիտակ', category: 'women', description: 'Նորաձև տարբերակ։', price: '9 900 ֏', available: true, image: p6 },
   { name: 'Շապիկ «Logo»', category: 'men', description: 'Բրենդային շապիկ։', price: '9 900 ֏', available: true, image: p7 },
   { name: 'Շապիկ «Հայաստան»', category: 'women', description: 'Հայաստան ոճով։', price: '9 900 ֏', available: true, image: p8 },
   { name: 'Շապիկ «Մինիմալ»', category: 'men', description: 'Պարզ դիզայն։', price: '9 900 ֏', available: true, image: p9 },
   { name: 'Շապիկ «Unisex»', category: 'women', description: 'Հարմար բոլորին։', price: '9 900 ֏', available: true, image: p10 },
];

const CatalogPage = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const inputRef = useRef(null);

   const category = searchParams.get('category');
   const search = searchParams.get('search')?.trim().toLowerCase() || '';

   const [searchInput, setSearchInput] = useState(search);

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

         <div className={styles.grid}>
            {filtered.length > 0 ? (
               filtered.map((item, i) => (
                  <div
                     className={`${styles.card} ${!item.available ? styles.unavailable : ''}`}
                     key={i}
                  >
                     <img src={item.image} alt={item.name} />
                     <h3 className={styles.productName}>{item.name}</h3>
                     <p className={styles.productDescription}>{item.description}</p>
                     <div className={styles.cardFooter}>
                        <div className={styles.productPrice}>
                           {item.available ? item.price : 'Առկա չէ'}
                        </div>
                        {item.available && (
                           <Link to={`/product/${i}`} className={styles.detailsBtn}>
                              Տեսնել մանրամասն
                           </Link>
                        )}
                     </div>
                  </div>
               ))
            ) : (
               <p className={styles.noResults}>Արդյունքներ չկան։</p>
            )}
         </div>
      </section>
   );
};

export default CatalogPage;
