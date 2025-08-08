import { useState } from 'react';
import styles from './AddProductForm.module.css';

const COLORS = [
   { value: 'white', label: 'Սպիտակ' },
   { value: 'black', label: 'Սեւ' },
   { value: 'red', label: 'Կարմիր' },
   { value: 'blue', label: 'Կապույտ' },
   { value: 'yellow', label: 'Դեղին' },
   { value: 'green', label: 'Կանաչ' },
];

const COLOR_ID_MAP = {
   white: 1,
   black: 2,
   red: 3,
   blue: 4,
   yellow: 5,
   green: 6,
};

const SIZE_ID_MAP = {
   XS: 1,
   S: 2,
   M: 3,
   L: 4,
   XL: 5,
   XXL: 6,
};

const AddProductForm = ({ onProductAdded }) => {
   const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      color: '',
      size: '',
      mainImage: null,
      thumbnail1: null,
      thumbnail2: null,
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value,
      }));
   };

   // Для файлов
   const handleFileChange = (e, field) => {
      const file = e.target.files[0];
      setFormData(prev => ({
         ...prev,
         [field]: file || null,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.stock || Number(formData.stock) < 1) {
         alert('Խնդրում ենք նշել քանակը (պահեստում)՝ նվազագույնը 1։');
         return;
      }

      const colorId = COLOR_ID_MAP[formData.color];
      const sizeId = SIZE_ID_MAP[formData.size];
      const quantity = Number(formData.stock);

      // Находим армянский лейбл цвета
      const colorLabel = COLORS.find(c => c.value === formData.color)?.label || '';
      // Формируем финальное имя с цветом (но в UI поле не меняем)
      const finalName = formData.name.trim() + (colorLabel ? ` ${colorLabel}` : '');

      const data = new FormData();
      data.append('name', finalName);
      data.append('description', formData.description.trim());
      data.append('price', formData.price);
      data.append('discount', formData.discount || '0');

      data.append('color_id', colorId);
      data.append('size_id', sizeId);
      data.append('quantity', quantity);

      if (formData.mainImage) data.append('images', formData.mainImage);
      if (formData.thumbnail1) data.append('images', formData.thumbnail1);
      if (formData.thumbnail2) data.append('images', formData.thumbnail2);

      try {
         const res = await fetch('http://localhost:10000/api/products', {
            method: 'POST',
            body: data,
         });

         if (!res.ok) throw new Error(`Ошибка ${res.status}`);

         const result = await res.json();
         if (onProductAdded) onProductAdded(result);

         setFormData({
            name: '',
            description: '',
            price: '',
            discount: '',
            stock: '',
            color: '',
            size: '',
            mainImage: null,
            thumbnail1: null,
            thumbnail2: null,
         });
      } catch (err) {
         console.error('🔴 Ошибка при добавлении:', err);
      }
   };

   return (
      <form onSubmit={handleSubmit} className={styles.form}>

         <label htmlFor="name">Անուն</label>
         <input
            type="text"
            id="name"
            name="name"
            value={formData.name ?? ''}
            onChange={handleChange}
            required
         />

         <label htmlFor="description">Նկարագրություն</label>
         <textarea
            id="description"
            name="description"
            value={formData.description ?? ''}
            onChange={handleChange}
            rows={2}
         />

         <div className={styles.formGroup}>
            <label htmlFor="stock">Քանակ (պահեստում)</label>
            <input
               type="number"
               id="stock"
               name="stock"
               value={formData.stock ?? ''}
               onChange={handleChange}
               min="0"
               required
            />
         </div>

         <label htmlFor="price">Գին (դրամ)</label>
         <input
            type="number"
            id="price"
            name="price"
            value={formData.price ?? ''}
            onChange={handleChange}
            required
            min="0"
         />

         <label htmlFor="discount">Զեղչ (%)</label>
         <input
            type="number"
            id="discount"
            name="discount"
            value={formData.discount ?? ''}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="0"
         />

         <div className={styles.sizePicker}>
            <label>Ընտրեք չափսը</label>
            <div className={styles.sizeOptions}>
               {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <label key={size} className={styles.sizeLabel}>
                     <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={formData.size === size}
                        onChange={handleChange}
                     />
                     <span className={styles.checkmark}></span>
                     {size}
                  </label>
               ))}
            </div>
         </div>

         <div className={styles.colorPicker}>
            <label>Ընտրեք գույնը</label>
            <div className={styles.colorOptions}>
               {COLORS.map(({ value }) => (
                  <label
                     key={value}
                     className={`${styles.colorCircle} ${styles[value]} ${formData.color === value ? styles.selected : ''
                        }`}
                  >
                     <input
                        type="radio"
                        name="color"
                        value={value}
                        checked={formData.color === value}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                     />
                  </label>
               ))}
            </div>
         </div>

         <div className={styles.imageUploadSection}>
            <label>Գլխավոր նկար</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => handleFileChange(e, 'mainImage')}
            />
            {formData.mainImage && (
               <img
                  src={URL.createObjectURL(formData.mainImage)}
                  alt="Main preview"
                  className={styles.previewImage}
               />
            )}

            <label>Լրացուցիչ 1</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => handleFileChange(e, 'thumbnail1')}
            />
            {formData.thumbnail1 && (
               <img
                  src={URL.createObjectURL(formData.thumbnail1)}
                  alt="Thumb 1"
                  className={styles.previewImage}
               />
            )}

            <label>Լրացուցիչ 2</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => handleFileChange(e, 'thumbnail2')}
            />
            {formData.thumbnail2 && (
               <img
                  src={URL.createObjectURL(formData.thumbnail2)}
                  alt="Thumb 2"
                  className={styles.previewImage}
               />
            )}
         </div>

         <button type="submit" className={styles.addButton}>
            Ավելացնել ապրանք
         </button>
      </form>
   );
};

export default AddProductForm;
