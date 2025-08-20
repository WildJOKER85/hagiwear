import { useState, useEffect, useRef, useCallback } from 'react';
import { FaSave, FaTimes, FaPen } from 'react-icons/fa';
import styles from './ProductCardEditable.module.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:10000";

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
      mainImage_url: null,
      thumb1_url: null,
      thumb2_url: null,
      mainImageDeleted: false,
      thumb1Deleted: false,
      thumb2Deleted: false,
   });

   // Рефы для input file, чтобы сбрасывать value
   const mainImageInputRef = useRef(null);
   const thumb1InputRef = useRef(null);
   const thumb2InputRef = useRef(null);

   const getImageSrc = (url) => {
      if (!url) return "/no-image.png";

      // Если blob: (локальное превью) — возвращаем как есть
      if (url.startsWith("blob:")) return url;

      // Если начинается с /images/... → добавляем API_URL
      if (url.startsWith("/images")) return `${API_URL}${url}`;

      // На всякий случай возвращаем как есть
      return url;
   };


   // 🔹 Инициализация / сброс формы
   const resetFormData = useCallback(() => {
      if (!product) return;

      setFormData(prev => ({
         name: product.name || '',
         description: product.description || '',
         price: product.price || 0,
         discount: product.discount || 0,
         stock: 0,
         color: product.color || null,
         size: product.size || null,

         // Если были локальные файлы — оставляем их
         mainImageFile: prev?.mainImageFile || null,
         thumb1File: prev?.thumb1File || null,
         thumb2File: prev?.thumb2File || null,

         // Превью оставляем если есть локальные файлы, иначе берем с сервера
         mainImage_url: prev?.mainImageFile ? prev.mainImage_url : product.main_image || null,
         thumb1_url: prev?.thumb1File ? prev.thumb1_url : product.thumb1 || null,
         thumb2_url: prev?.thumb2File ? prev.thumb2_url : product.thumb2 || null,

         mainImageDeleted: prev?.mainImageDeleted || false,
         thumb1Deleted: prev?.thumb1Deleted || false,
         thumb2Deleted: prev?.thumb2Deleted || false,
      }));

      console.log("🔄 [resetFormData] formData сброшен:", product);
   }, [product]);

   const fetchStock = useCallback(async () => {
      if (!product?.id) return;
      try {
         const res = await fetch(`http://localhost:10000/api/stock/${product.id}`);
         if (!res.ok) throw new Error(`Ошибка ${res.status}`);
         const data = await res.json();
         setStockList(data || []);
         if (data.length) {
            const color = product.color || data[0].color_id;
            const size = product.size || data[0].size_id;
            const found = data.find(s => s.color_id === color && s.size_id === size);
            setFormData(prev => ({
               ...prev,
               stock: found ? found.quantity : 0,
               color,
               size,
            }));
         }
      } catch (e) {
         console.error('Ошибка подгрузки склада:', e);
         setStockList([]);
      }
   }, [product]);

   useEffect(() => {
      if (product?.id) {
         resetFormData();
         fetchStock();
      }
   }, [product, resetFormData, fetchStock]);

   useEffect(() => {
      if (formData.color && formData.size && stockList.length > 0) {
         const found = stockList.find(
            s => s.color_id === formData.color && s.size_id === formData.size
         );
         if (found) setFormData(prev => ({ ...prev, stock: found.quantity }));
      }
   }, [formData.color, formData.size, stockList]);

   const handleInputChange = e => {
      const { name, value, type } = e.target;
      if (type === 'radio' && name === 'color') setFormData(prev => ({ ...prev, color: Number(value) }));
      else if (type === 'radio' && name === 'size') setFormData(prev => ({ ...prev, size: Number(value) }));
      else setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleFileChange = e => {
      const { name, files } = e.target;
      if (!files?.length) return;
      const file = files[0];
      const key = name.replace("File", "");
      const previewUrl = URL.createObjectURL(file);

      setFormData(prev => ({
         ...prev,
         [name]: file,          // локальный File
         [key + "_url"]: previewUrl, // preview
         [key + "Deleted"]: false,   // сбрасываем флаг удаления
      }));

      console.log(`🖼 [handleFileChange] ${key} загружен`, { file, previewUrl });
   };

   const handleRemoveImage = field => {
      setFormData(prev => ({
         ...prev,
         [field + 'File']: null,
         [field + '_url']: null,
         [field + 'Deleted']: true,
      }));

      // Сбрасываем input через ref
      if (field === 'mainImage' && mainImageInputRef.current) mainImageInputRef.current.value = '';
      if (field === 'thumb1' && thumb1InputRef.current) thumb1InputRef.current.value = '';
      if (field === 'thumb2' && thumb2InputRef.current) thumb2InputRef.current.value = '';

      // Обновляем ключ input, чтобы React пересоздал элемент
      setFileInputKey(Date.now());

      console.log(`🗑 [handleRemoveImage] вызван для поля: ${field}`);
   };
   // При отмене редактирования — откатываем состояние
   const handleCancel = () => {
      resetFormData();
      setMode('collapsed');
   };

   const handleSubmit = async e => {
      e.preventDefault();
      try {
         const updatedProduct = await onSave(product?.id, formData);

         if (updatedProduct) {
            setFormData(prev => ({
               ...prev,
               name: updatedProduct.name || prev.name,
               description: updatedProduct.description || prev.description,
               price: updatedProduct.price || prev.price,
               discount: updatedProduct.discount || prev.discount,
               stock: updatedProduct.stock || prev.stock,

               // сохраняем локальные preview, если файл не был изменён
               mainImage_url: prev.mainImageFile ? prev.mainImage_url : updatedProduct.main_image || prev.mainImage_url,
               thumb1_url: prev.thumb1File ? prev.thumb1_url : updatedProduct.thumb1 || prev.thumb1_url,
               thumb2_url: prev.thumb2File ? prev.thumb2_url : updatedProduct.thumb2 || prev.thumb2_url,

               mainImageFile: null,
               thumb1File: null,
               thumb2File: null,

               mainImageDeleted: false,
               thumb1Deleted: false,
               thumb2Deleted: false,
            }));
            setMode('collapsed');
         }
      } catch (err) {
         console.error("❌ Ошибка при сохранении:", err);
      }
   };

   useEffect(() => {
      console.log('📥 formData обновился:', formData);
   }, [formData]);

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
                     {[
                        { key: 'mainImage', label: 'Գլխավոր նկարը', ref: mainImageInputRef },
                        { key: 'thumb1', label: 'Լրացուցիչ 1', ref: thumb1InputRef },
                        { key: 'thumb2', label: 'Լրացուցիչ 2', ref: thumb2InputRef },
                     ].map(({ key, label, ref }) => (
                        <div key={key} className={styles.imageInputWrapper}>
                           <label>{label}</label>

                           {formData[key + '_url'] ? (
                              <div className={styles.previewWrapper}>
                                 <img
                                    src={getImageSrc(formData[key + '_url'])}
                                    alt={`${key} preview`}
                                    className={styles.previewImage}
                                 />
                                 <button
                                    type="button"
                                    className={styles.removeImageButton}
                                    onClick={() => handleRemoveImage(key)}
                                    title="Ջնջել նկարը"
                                 >
                                    x
                                 </button>
                              </div>
                           ) : null}

                           <input
                              key={fileInputKey + key}
                              type="file"
                              accept="image/*"
                              name={key + 'File'}
                              onChange={handleFileChange}
                              className={styles.inpImg}
                              ref={ref}
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
            {formData.mainImage_url && (
               <img
                  src={getImageSrc(formData.mainImage_url)}
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
   console.log('Фото Брокен' + formData.mainImage_url);
   return (
      <div className={styles.card}>
         <img
            src={getImageSrc(formData.mainImage_url)}
            alt={formData.name}
            className={styles.image}
         />
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
