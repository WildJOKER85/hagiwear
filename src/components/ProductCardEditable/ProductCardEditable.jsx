import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPen } from 'react-icons/fa';
import styles from './ProductCardEditable.module.css';

const COLORS = [
   { label: 'Սպիտակ', value: 'white' },
   { label: 'Սեւ', value: 'black' },
   { label: 'Կարմիր', value: 'red' },
   { label: 'Կապույտ', value: 'blue' },
   { label: 'Դեղին', value: 'yellow' },
   { label: 'Կանաչ', value: 'green' },
];


const ProductCardEditable = ({ product, onSave, onDelete }) => {
   const [mode, setMode] = useState('collapsed'); // collapsed | expanded | edit

   const baseUrl = 'http://localhost:10000/images/products/';

   const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      color: '',
      sizes: [],
      mainImageFile: null,
      thumb1File: null,
      thumb2File: null,
      main_image_url: '',
      thumb1_url: '',
      thumb2_url: '',
   });

   useEffect(() => {
      if (product) {
         console.log('product:', product);

         console.log('main_image:', product.main_image);
         console.log('thumb1:', product.thumb1);
         console.log('thumb2:', product.thumb2);

         console.log('formData values to set:', {
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            discount: product.discount || 0,
            stock: product.stock || 0,
            color: product.colors || '',
            sizes: product.sizes ? product.sizes.split(',').map(s => s.trim()) : [],
            mainImageFile: null,
            thumb1File: null,
            thumb2File: null,
            main_image_url: product.main_image
               ? (product.main_image.startsWith('http') ? product.main_image : baseUrl + product.main_image)
               : '',
            thumb1_url: product.thumb1
               ? (product.thumb1.startsWith('http') ? product.thumb1 : baseUrl + product.thumb1)
               : '',
            thumb2_url: product.thumb2
               ? (product.thumb2.startsWith('http') ? product.thumb2 : baseUrl + product.thumb2)
               : '',
         });

         setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            discount: product.discount || 0,
            stock: product.stock || 0,
            color: product.colors || '',
            sizes: product.sizes ? product.sizes.split(',').map(s => s.trim()) : [],
            mainImageFile: null,
            thumb1File: null,
            thumb2File: null,
            main_image_url: product.main_image
               ? (product.main_image.startsWith('http') ? product.main_image : baseUrl + product.main_image)
               : '',
            thumb1_url: product.thumb1
               ? (product.thumb1.startsWith('http') ? product.thumb1 : baseUrl + product.thumb1)
               : '',
            thumb2_url: product.thumb2
               ? (product.thumb2.startsWith('http') ? product.thumb2 : baseUrl + product.thumb2)
               : '',
         });
      }
   }, [product]);


   const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      if (name === 'sizes') {
         let newSizes = [...formData.sizes];
         if (checked) {
            if (!newSizes.includes(value)) newSizes.push(value);
         } else {
            newSizes = newSizes.filter(s => s !== value);
         }
         setFormData(prev => ({ ...prev, sizes: newSizes }));
      } else if (type === 'radio' && name === 'color') {
         setFormData(prev => ({ ...prev, color: value }));
      } else {
         setFormData(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleFileChange = (e) => {
      const { name, files } = e.target;
      if (!files || files.length === 0) return;

      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      if (name === 'mainImageFile') {
         setFormData(prev => ({ ...prev, mainImageFile: file, main_image_url: previewUrl }));
      } else if (name === 'thumb1File') {
         setFormData(prev => ({ ...prev, thumb1File: file, thumb1_url: previewUrl }));
      } else if (name === 'thumb2File') {
         setFormData(prev => ({ ...prev, thumb2File: file, thumb2_url: previewUrl }));
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      const updatedData = {
         name: formData.name,
         description: formData.description,
         price: Number(formData.price),
         discount: Number(formData.discount),
         stock: Number(formData.stock),
         colors: formData.color,
         sizes: formData.sizes.join(', '),
         mainImageFile: formData.mainImageFile,
         thumb1File: formData.thumb1File,
         thumb2File: formData.thumb2File,
      };

      onSave(product.id, updatedData);
      setMode('collapsed');
   };

   const handleRemoveImage = (field) => {
      setFormData(prev => ({
         ...prev,
         [field + 'File']: null,
         [field + '_url']: '',
      }));
   };

   // Рендер режима редактирования
   if (mode === 'edit') {
      return (
         <div className={`${styles.card} ${styles.editMode}`}>
            <form onSubmit={handleSubmit} className={styles.editForm}>
               {/* Все поля (как у тебя) */}
               <label>
                  Անուն:
                  <input
                     type="text"
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     required
                  />
               </label>

               <label>
                  Նկարագրություն:
                  <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     rows={3}
                  />
               </label>

               <label>
                  Գին (֏):
                  <input
                     type="number"
                     name="price"
                     value={formData.price}
                     min="0"
                     onChange={handleInputChange}
                     required
                  />
               </label>

               <label>
                  Զեղչ (%):
                  <input
                     type="number"
                     name="discount"
                     value={formData.discount}
                     min="0"
                     max="100"
                     onChange={handleInputChange}
                  />
               </label>

               <label>
                  Պահեստում քանակ:
                  <input
                     type="number"
                     name="stock"
                     value={formData.stock}
                     min="0"
                     onChange={handleInputChange}
                  />
               </label>

               <fieldset>
                  <legend>Գույն</legend>
                  <div className={styles.colorPicker}>
                     <div className={styles.colorOptions}>
                        {COLORS.map(({ value }) => (
                           <label
                              key={value}
                              className={`${styles.colorCircle} ${styles[value]} ${formData.color === value ? styles.selected : ''
                                 }`}
                           >
                              <input
                                 type="radio"
                                 name={`color-${product.id}`}
                                 value={value}
                                 checked={formData.color === value}
                                 onChange={(e) =>
                                    setFormData({ ...formData, color: e.target.value })
                                 }
                              />
                           </label>
                        ))}
                     </div>
                  </div>
               </fieldset>

               <fieldset>
                  <legend>Չափսեր</legend>
                  <div className={styles.sizePicker}>
                     {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <label key={size} className={styles.sizeLabel}>
                           <input
                              type="radio"
                              name={`size-${product.id}`}
                              value={size}
                              checked={formData.size === size}
                              onChange={(e) =>
                                 setFormData({ ...formData, size: e.target.value })
                              }
                           />
                           <span className={styles.checkmark}></span>
                           {size}
                        </label>
                     ))}
                  </div>
               </fieldset>

               <fieldset>
                  <legend>Նկարներ</legend>
                  <div className={styles.imagesGroup}>
                     {['main_image', 'thumb1', 'thumb2'].map((field, idx) => (
                        <div key={field} className={styles.imageInputWrapper}>
                           <label>
                              {field === 'main_image' ? 'Գլխավոր նկարը' : field === 'thumb1' ? 'Լրացուցիչ 1' : 'Լրացուցիչ 2'}
                           </label>

                           {formData[field + '_url'] && (
                              <div className={styles.previewWrapper}>
                                 <img
                                    src={formData[field + '_url']}
                                    alt={`${field} preview`}
                                    className={styles.previewImage}
                                 />
                                 <button
                                    type="button"
                                    className={styles.removeImageButton}
                                    onClick={() => handleRemoveImage(field)}
                                    title="Ջնջել նկարը"
                                 >
                                    ×
                                 </button>
                              </div>
                           )}

                           <input
                              type="file"
                              accept="image/*"
                              name={field + 'File'}
                              onChange={handleFileChange}
                              className={styles.inpImg}
                           />
                        </div>
                     ))}
                  </div>
               </fieldset>

               <div className={styles.editActions}>
                  <button type="submit" title="Պահպանել"><FaSave /></button>
                  <button type="button" onClick={() => setMode('collapsed')} title="Չեղարկել"><FaTimes /></button>
               </div>
            </form>
         </div>
      );
   }

   // Режим expanded — кнопки справа от фото, маленькие
   if (mode === 'expanded') {
      return (
         <div className={`${styles.card} ${styles.expanded}`}>
            <img
               src={formData.main_image_url}
               alt={formData.name}
               className={styles.image}
            />
            <div className={styles.info}>
               <h3>{formData.name}</h3>
               <p><strong>Նկարագրություն:</strong> {formData.description}</p>
               <p><strong>Գին:</strong> {formData.price} ֏</p>
               <p><strong>Զեղչ:</strong> {formData.discount}%</p>
               <p><strong>Քանակ պահեստում:</strong> {formData.stock}</p>
               <p><strong>Չափսեր:</strong> {formData.sizes.join(', ')}</p>
               <p><strong>Գույն:</strong> {COLORS.find(c => c.value === formData.color)?.label || formData.color}</p>
            </div>
            <div className={`${styles.actions} ${styles.compactActions}`}>
               <button onClick={() => setMode('edit')} title="Խմբագրել"><FaPen /></button>
               <button onClick={() => setMode('collapsed')} title="Փակել"><FaTimes /></button>
            </div>
         </div>
      );
   }

   // collapsed — кнопки большие снизу
   return (
      <div className={styles.card}>
         <img
            src={formData.main_image_url}
            alt={formData.name}
            className={styles.image}
         />
         <div className={styles.info}>
            <h4>{formData.name}</h4>
            <div className={styles.priceBlock}>
               {formData.discount > 0 ? (
                  <>
                     <span className={styles.oldPrice}>
                        {formData.price} ֏
                     </span>
                     <span className={styles.newPrice}>
                        {Math.round(formData.price * (1 - formData.discount / 100))} ֏
                     </span>
                     <span className={styles.discountTag}>
                        -{formData.discount}%
                     </span>
                  </>
               ) : (
                  <span className={styles.newPrice}>
                     {formData.price} ֏
                  </span>
               )}
            </div>
         </div>
         <div className={styles.actions}>
            <button onClick={() => setMode('expanded')} title="Դիտել"><FaPen /></button>
            <button onClick={() => onDelete(product.id)} title="Ջնջել"><FaTimes /></button>
         </div>
      </div>
   );
};

export default ProductCardEditable;
