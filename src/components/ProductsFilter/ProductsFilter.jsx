import { useState, useEffect } from 'react';
import styles from './ProductsFilter.module.css';

const colors = [
   { id: '', label: 'Բոլորը (Գույներ)' },
   { id: '1', label: 'Սպիտակ' },
   { id: '2', label: 'Սև' },
   { id: '3', label: 'Կարմիր' },
   { id: '4', label: 'Կապույտ' },
   { id: '5', label: 'Դեղին' },
   { id: '6', label: 'Կանաչ' },
];

const sizes = [
   { id: '', label: 'Բոլորը (Չափսեր)' },
   { id: '1', label: 'XS' },
   { id: '2', label: 'S' },
   { id: '3', label: 'M' },
   { id: '4', label: 'L' },
   { id: '5', label: 'XL' },
   { id: '6', label: 'XXL' },
];

const ProductsFilter = ({ pendingFilters, onFilterChange }) => {
   const [name, setName] = useState('');
   const [colorId, setColorId] = useState('');
   const [sizeId, setSizeId] = useState('');
   const [discountOnly, setDiscountOnly] = useState(false);
   const [priceMin, setPriceMin] = useState('');
   const [priceMax, setPriceMax] = useState('');
   const [createdFrom, setCreatedFrom] = useState('');
   const [createdTo, setCreatedTo] = useState('');
   const [updatedFrom, setUpdatedFrom] = useState('');
   const [updatedTo, setUpdatedTo] = useState('');

   // --- Авто-синхронизация с pendingFilters ---
   useEffect(() => {
      const timeout = setTimeout(() => {
         onFilterChange({
            name: name.trim(),
            color_id: colorId,
            size_id: sizeId,
            discount_only: discountOnly,
            price_min: priceMin,
            price_max: priceMax,
            created_from: createdFrom,
            created_to: createdTo,
            updated_from: updatedFrom,
            updated_to: updatedTo
         });
      }, 300);

      return () => clearTimeout(timeout);
   }, [
      name, colorId, sizeId, discountOnly,
      priceMin, priceMax, createdFrom, createdTo,
      updatedFrom, updatedTo, onFilterChange
   ]);

   // --- Сброс локальных полей, если pendingFilters очищены ---
   useEffect(() => {
      if (!pendingFilters || Object.keys(pendingFilters).length === 0) {
         setName('');
         setColorId('');
         setSizeId('');
         setDiscountOnly(false);
         setPriceMin('');
         setPriceMax('');
         setCreatedFrom('');
         setCreatedTo('');
         setUpdatedFrom('');
         setUpdatedTo('');
      }
   }, [pendingFilters]);

   return (
      <div className={styles.filterContainer}>
         {/* Поиск по имени */}
         <input
            type="text"
            placeholder="Որոնել ապրանքը անունով"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
         />

         {/* Выбор цвета */}
         <select value={colorId} onChange={e => setColorId(e.target.value)} className={styles.select}>
            {colors.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
         </select>

         {/* Выбор размера */}
         <select value={sizeId} onChange={e => setSizeId(e.target.value)} className={styles.select}>
            {sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
         </select>

         {/* Только скидка */}
         <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={discountOnly} onChange={e => setDiscountOnly(e.target.checked)} />
            Միայն զեղչվածները
         </label>

         {/* Фильтр по цене */}
         <input
            type="number"
            placeholder="Մինիմալ գին"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className={styles.input}
            min="0"
         />
         <input
            type="number"
            placeholder="Մաքսիմալ գին"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className={styles.input}
            min="0"
         />

         {/* Фильтр по дате создания */}
         <label className={styles.label}>Սկիզբ (ավելացում)</label>
         <input type="date" value={createdFrom} onChange={e => setCreatedFrom(e.target.value)} className={styles.input} />
         <label className={styles.label}>Ավարտ (ավելացում)</label>
         <input type="date" value={createdTo} onChange={e => setCreatedTo(e.target.value)} className={styles.input} />

         {/* Фильтр по дате обновления */}
         <label className={styles.label}>Սկիզբ (փոփոխություն)</label>
         <input type="date" value={updatedFrom} onChange={e => setUpdatedFrom(e.target.value)} className={styles.input} />
         <label className={styles.label}>Ավարտ (փոփոխություն)</label>
         <input type="date" value={updatedTo} onChange={e => setUpdatedTo(e.target.value)} className={styles.input} />
      </div>
   );
};

export default ProductsFilter;
