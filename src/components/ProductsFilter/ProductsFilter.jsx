import { useState, useEffect } from 'react';
import styles from './ProductsFilter.module.css';

const colors = [
   { id: '', label: 'Բոլորը' },
   { id: '1', label: 'Սպիտակ' },
   { id: '2', label: 'Սև' },
   { id: '3', label: 'Կարմիր' },
   { id: '4', label: 'Կապույտ' },
   { id: '5', label: 'Դեղին' },
   { id: '6', label: 'Կանաչ' },
];

const sizes = [
   { id: '', label: 'Բոլորը' },
   { id: 'XS', label: 'XS' },
   { id: 'S', label: 'S' },
   { id: 'M', label: 'M' },
   { id: 'L', label: 'L' },
   { id: 'XL', label: 'XL' },
   { id: 'XXL', label: 'XXL' },
];

const ProductsFilter = ({ onFilterChange }) => {
   const [name, setName] = useState('');
   const [colorId, setColorId] = useState('');  // будет хранить id (число в строке)
   const [sizeId, setSizeId] = useState('');    // тоже id
   const [discountOnly, setDiscountOnly] = useState(false);
   const [priceMin, setPriceMin] = useState('');
   const [priceMax, setPriceMax] = useState('');
   const [dateFrom, setDateFrom] = useState('');
   const [dateTo, setDateTo] = useState('');

   useEffect(() => {
      const timeout = setTimeout(() => {
         const filters = {
            name: name.trim(),
            color_id: colorId,   // сюда именно id, не label!
            size_id: sizeId,     // тоже
            discount_only: discountOnly,
            price_min: priceMin,
            price_max: priceMax,
            date_from: dateFrom,
            date_to: dateTo,
         };
         console.log('Fetching products with:', filters);
         onFilterChange(filters);
      }, 300); // debounce 300 мс

      return () => clearTimeout(timeout);
   }, [name, colorId, sizeId, discountOnly, priceMin, priceMax, dateFrom, dateTo, onFilterChange]);

   return (
      <div className={styles.filterContainer}>
         <input
            type="text"
            placeholder="Որոնել ապրանքը անունով"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
            name="name"
         />

         <select
            value={colorId}
            onChange={e => setColorId(e.target.value)}
            className={styles.select}
            name="color_id"
         >
            {colors.map(c => (
               <option key={c.id} value={c.id}>{c.label}</option>
            ))}
         </select>

         <select
            value={sizeId}
            onChange={e => setSizeId(e.target.value)}
            className={styles.select}
            name="size_id"
         >
            {sizes.map(s => (
               <option key={s.id} value={s.id}>{s.label}</option>
            ))}
         </select>

         <label className={styles.checkboxLabel}>
            <input
               type="checkbox"
               checked={discountOnly}
               onChange={e => setDiscountOnly(e.target.checked)}
               name="discount_only"
            />
            Միայն զեղչվածները
         </label>

         <input
            type="number"
            placeholder="Մինիմալ գին"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className={styles.input}
            min="0"
            name="price_min"
         />

         <input
            type="number"
            placeholder="Մաքսիմալ գին"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className={styles.input}
            min="0"
            name="price_max"
         />

         <label className={styles.label}>Սկիզբ (дата от):</label>
         <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={styles.input}
            name="date_from"
         />

         <label className={styles.label}>Ավարտ (дата до):</label>
         <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={styles.input}
            name="date_to"
         />
      </div>
   );
};

export default ProductsFilter;
