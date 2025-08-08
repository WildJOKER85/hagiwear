import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSave, FaTimes, FaPen } from 'react-icons/fa';
import styles from './ProductCardEditable.module.css';

const COLORS = [
   { id: 1, value: 'white', label: 'Սպիտակ' },
   { id: 2, value: 'black', label: 'Սեւ' },
   { id: 3, value: 'red', label: 'Կարմիր' },
   { id: 4, value: 'blue', label: 'Կապույտ' },
   { id: 5, value: 'yellow', label: 'Դեղին' },
   { id: 6, value: 'green', label: 'Կանաչ' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sizeNameToId = {
   XS: 1,
   S: 2,
   M: 3,
   L: 4,
   XL: 5,
   XXL: 6,
};

const ProductCardEditable = ({ product, onSave, onDelete }) => {
   const [mode, setMode] = useState('collapsed');
   const [stockList, setStockList] = useState([]);
   const [fileInputKey, setFileInputKey] = useState(Date.now());

   // Локальное состояние для формы редактирования (копия product)
   const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      color: null,
      size: null,
      mainImageFile: null,
      thumb1File: null,
      thumb2File: null,
      main_image_url: null,
      thumb1_url: null,
      thumb2_url: null,
   });

   // Рефы для input file, чтобы сбрасывать value
   const mainImageInputRef = useRef(null);
   const thumb1InputRef = useRef(null);
   const thumb2InputRef = useRef(null);

   // Функция для копирования данных из product в formData
   const resetFormData = useCallback(() => {
      setFormData({
         name: product.name || '',
         description: product.description || '',
         price: product.price || 0,
         discount: product.discount || 0,
         stock: 0,
         color: null,
         size: null,
         mainImageFile: null,
         thumb1File: null,
         thumb2File: null,
         main_image_url: product.main_image || null,
         thumb1_url: product.thumb1 || null,
         thumb2_url: product.thumb2 || null,
      });
      setStockList([]);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
      if (thumb1InputRef.current) thumb1InputRef.current.value = '';
      if (thumb2InputRef.current) thumb2InputRef.current.value = '';
   }, [product]);

   // При смене товара или открытии редактирования — копируем данные
   useEffect(() => {
      if (product?.id) {
         resetFormData();

         // Подгрузка склада (stock)
         async function fetchStock() {
            try {
               const res = await fetch(`http://localhost:10000/api/stock/${product.id}`);
               if (!res.ok) throw new Error(`Ошибка ${res.status}`);

               const data = await res.json();
               setStockList(data);

               if (data.length > 0) {
                  setFormData(prev => ({
                     ...prev,
                     color: data[0].color_id,
                     size: data[0].size_id,
                     stock: data[0].quantity,
                  }));
               }
            } catch (e) {
               console.error(e);
               setStockList([]);
            }
         }
         fetchStock();
      }
   }, [product, resetFormData]);

   // При изменении цвета/размера обновлять количество
   useEffect(() => {
      if (formData.color && formData.size) {
         const found = stockList.find(
            s => s.color_id === formData.color && s.size_id === formData.size
         );
         setFormData(prev => ({
            ...prev,
            stock: found ? found.quantity : 0,
         }));
      }
   }, [formData.color, formData.size, stockList]);

   const handleInputChange = e => {
      const { name, value, type } = e.target;
      if (type === 'radio' && name === 'color') {
         setFormData(prev => ({ ...prev, color: Number(value) }));
      } else if (type === 'radio' && name === 'size') {
         setFormData(prev => ({ ...prev, size: Number(value) }));
      } else {
         setFormData(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleFileChange = e => {
      const { name, files } = e.target;
      if (!files?.length) {
         console.log('📭 handleFileChange: файлы отсутствуют');
         return;
      }

      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      console.log(`📤 handleFileChange: выбран файл для поля "${name}"`, file);

      // вычисляем имя поля URL
      const urlField = name.replace('File', '_url');

      setFormData(prev => ({
         ...prev,
         [name]: file,
         [urlField]: previewUrl,
      }));

      console.log('🧩 formData после изменения: ', {
         ...formData,
         [name]: file,
         [urlField]: previewUrl,
      });
   };

   const handleRemoveImage = field => {
      console.log(`handleRemoveImage вызван для поля: ${field}`);

      setFormData(prev => ({
         ...prev,
         [field + '_url']: null,
         [field + 'File']: null,
      }));

      const refMap = {
         main_image: mainImageInputRef,
         thumb1: thumb1InputRef,
         thumb2: thumb2InputRef,
      };

      const inputRef = refMap[field];
      if (inputRef?.current) {
         console.log(`Сбрасываю ${field} inputRef.value`);
         inputRef.current.value = '';
      } else {
         console.log('Нет рефа для этого поля или поле не совпало');
      }

      // Форсируем обновление input, чтобы можно было выбрать тот же файл
      setFileInputKey(Date.now());
   };


   // При отмене редактирования — откатываем состояние
   const handleCancel = () => {
      resetFormData();
      setMode('collapsed');
   };

   const handleSubmit = e => {
      e.preventDefault();

      onSave(product.id, {
         name: formData.name,
         description: formData.description,
         price: Number(formData.price),
         discount: Number(formData.discount),
         color_id: Number(formData.color),
         size_id: Number(formData.size),
         quantity: Number(formData.stock),
         mainImageFile: formData.mainImageFile,
         thumb1File: formData.thumb1File,
         thumb2File: formData.thumb2File,
      });

      setMode('collapsed');
   };

   if (mode === 'edit') {
      return (
         <div className={`${styles.card} ${styles.editMode}`}>
            <form onSubmit={handleSubmit} className={styles.editForm}>
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
                        {COLORS.map(({ id, value }) => (
                           <label
                              key={id}
                              className={`${styles.colorCircle} ${styles[value]} ${formData.color === id ? styles.selected : ''
                                 }`}
                           >
                              <input
                                 type="radio"
                                 name="color"
                                 value={id}
                                 checked={formData.color === id}
                                 onChange={handleInputChange}
                              />
                           </label>
                        ))}
                     </div>
                  </div>
               </fieldset>

               <fieldset>
                  <legend>Չափսեր</legend>
                  <div className={styles.sizePicker}>
                     {SIZES.map(sizeName => (
                        <label key={sizeName} className={styles.sizeLabel}>
                           <input
                              type="radio"
                              name="size"
                              value={sizeNameToId[sizeName]}
                              checked={formData.size === sizeNameToId[sizeName]}
                              onChange={handleInputChange}
                           />
                           <span className={styles.checkmark}></span>
                           {sizeName}
                        </label>
                     ))}
                  </div>
               </fieldset>

               <fieldset>
                  <legend>Նկարներ</legend>
                  <div className={styles.imagesGroup}>
                     {['main_image', 'thumb1', 'thumb2'].map(field => (
                        <div key={field} className={styles.imageInputWrapper}>
                           <label>
                              {field === 'main_image'
                                 ? 'Գլխավոր նկարը'
                                 : field === 'thumb1'
                                    ? 'Լրացուցիչ 1'
                                    : 'Լրացուցիչ 2'}
                           </label>

                           {formData[field + '_url'] ? (
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
                                    x
                                 </button>
                              </div>
                           ) : null}

                           <input
                              key={fileInputKey + field}
                              type="file"
                              accept="image/*"
                              name={field + 'File'}
                              onChange={handleFileChange}
                              className={styles.inpImg}
                              ref={
                                 field === 'main_image'
                                    ? mainImageInputRef
                                    : field === 'thumb1'
                                       ? thumb1InputRef
                                       : thumb2InputRef
                              }
                           />
                        </div>
                     ))}
                  </div>
               </fieldset>

               <div className={styles.editActions}>
                  <button type="submit" title="Պահպանել">
                     <FaSave />
                  </button>
                  <button type="button" onClick={handleCancel} title="Չեղարկել">
                     <FaTimes />
                  </button>
               </div>
            </form>
         </div>
      );
   }

   if (mode === 'expanded') {
      return (
         <div className={`${styles.card} ${styles.expanded}`}>
            {formData.main_image_url && (
               <img
                  src={formData.main_image_url}
                  alt={formData.name}
                  className={styles.image}
               />
            )}
            <div className={styles.info}>
               <h3>{formData.name}</h3>
               <p>
                  <strong>Նկարագրություն:</strong> {formData.description}
               </p>
               <p>
                  <strong>Գին:</strong> {formData.price} ֏
               </p>
               {formData.discount > 0 && (
                  <p>
                     <strong>Զեղչ: </strong> -{formData.discount}% →{' '}
                     {Math.round(formData.price * (1 - formData.discount / 100))} ֏
                  </p>
               )}
               <p>
                  <strong>Քանակ պահեստում:</strong> {formData.stock}
               </p>
               <p>
                  <strong>Չափս:</strong> {''}{' '}
                  {SIZES.find(s => sizeNameToId[s] === formData.size) || formData.size}
               </p>
               <p>
                  <strong>Գույն:</strong>{' '}
                  {COLORS.find(c => c.id === formData.color)?.label || formData.color}
               </p>
            </div>
            <div className={`${styles.actions} ${styles.compactActions}`}>
               <button onClick={() => setMode('edit')} title="Խմբագրել">
                  <FaPen />
               </button>
               <button onClick={() => setMode('collapsed')} title="Փակել">
                  <FaTimes />
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.card}>
         {formData.main_image_url && (
            <img
               src={formData.main_image_url || '/no-image.png'}
               alt={formData.name}
               className={styles.image}
            />
         )}
         <div className={styles.info}>
            <h4>{formData.name}</h4>
            <div className={styles.priceBlock}>
               {formData.discount > 0 ? (
                  <>
                     <span className={styles.oldPrice}>{formData.price} ֏</span>
                     <span className={styles.newPrice}>
                        {Math.round(formData.price * (1 - formData.discount / 100))} ֏
                     </span>
                     <span className={styles.discountTag}>-{formData.discount}%</span>
                  </>
               ) : (
                  <span className={styles.newPrice}>{formData.price} ֏</span>
               )}
            </div>
         </div>
         <div className={styles.actions}>
            <button onClick={() => setMode('expanded')} title="Դիտել">
               <FaPen />
            </button>
            <button onClick={() => onDelete(product.id)} title="Ջնջել">
               <FaTimes />
            </button>
         </div>
      </div>
   );
};

export default ProductCardEditable;
