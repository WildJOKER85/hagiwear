import styles from './CatalogPage.module.css';
import { Link, useSearchParams } from 'react-router-dom';

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

const collectionName = 'Նոր անուն, նոր խոսք, նոր ձև';

const products = [
   { name: 'Շապիկ «Ազդեցիկ» Սպիտակ', category: 'men', description: 'Սպիտակ շապիկ՝ մաքուր ձևավորմամբ և բարձր որակով։', price: '9 900 ֏', available: true, image: p1 },
   { name: 'Շապիկ «Ազդեցիկ» Սև', category: 'men', description: 'Սև տարբերակ՝ ուժեղ և խիզախ ոճով։', price: '9 900 ֏', available: true, image: p2 },
   { name: 'Շապիկ «Սրամիտ» Սև', category: 'men', description: 'Հումորով շապիկ՝ երիտասարդ ոճի համար։', price: '9 900 ֏', available: false, image: p3 },
   { name: 'Շապիկ «Սրամիտ» Սև', category: 'women', description: 'Մեղմ սրամտությամբ շապիկ՝ առօրյա կրելու համար։', price: '9 900 ֏', available: true, image: p4 },
   { name: 'Շապիկ «Ոճային» Սպիտակ', category: 'women', description: 'Ժամանակակից, պարզ և ոճային ընտրություն։', price: '9 900 ֏', available: true, image: p5 },
   { name: 'Շապիկ «Ոճային» Սպիտակ', category: 'women', description: 'Հարմարավետ և նորաձև տարբերակ։', price: '9 900 ֏', available: true, image: p6 },
   { name: 'Շապիկ «Logo»', category: 'men', description: 'Մինիմալիստական դիզայնով բրենդային շապիկ։', price: '9 900 ֏', available: true, image: p7 },
   { name: 'Շապիկ «Հայաստան»', category: 'women', description: 'Հպարտորեն՝ Հայաստանի ոճով։', price: '9 900 ֏', available: true, image: p8 },
   { name: 'Շապիկ «Մինիմալ»', category: 'men', description: 'Հատուկ նրանց համար, ովքեր սիրում են պարզությունը։', price: '9 900 ֏', available: true, image: p9 },
   { name: 'Շապիկ «Unisex»', category: 'women', description: 'Հարմար բոլորին՝ անկախ սեռից։', price: '9 900 ֏', available: true, image: p10 },
];

const CatalogPage = () => {
   const [searchParams] = useSearchParams();
   const category = searchParams.get('category'); // "men", "women", или null

   const filteredProducts = category
      ? products.filter((p) => p.category === category)
      : products;

   const getTitle = () => {
      if (category === 'men') return 'Տղամարդկանց հավաքածու';
      if (category === 'women') return 'Կանանց հավաքածու';
      return collectionName;
   };

   return (
      <section className={styles.catalog}>
         <h1 className={styles.pageTitle}>{getTitle()}</h1>
         <div className={styles.grid}>
            {filteredProducts.map((item, i) => (
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
            ))}
         </div>
      </section>
   );
};

export default CatalogPage;
