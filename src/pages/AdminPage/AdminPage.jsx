// Шаг 1. Обновим AdminPage.jsx, чтобы можно было загружать
// 1 главное и 2 доп. изображения с отдельными input'ами
// Мы используем refs для каждого поля (главное, доп1, доп2)

import { useEffect, useState, useRef } from 'react';
import styles from './AdminPage.module.css';

const API_URL = 'http://localhost:10000/api/products';

const AdminPage = () => {
   const [products, setProducts] = useState([]);
   const [formData, setFormData] = useState({
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      discount: '',
      colors: '',
      sizes: '',
   });
   const [isEditing, setIsEditing] = useState(false);
   const mainImageRef = useRef(null);
   const extraImage1Ref = useRef(null);
   const extraImage2Ref = useRef(null);

   const loadProducts = () => {
      fetch(`${API_URL}?t=${Date.now()}`)
         .then((res) => {
            if (!res.ok) throw new Error(`Սխալ: ${res.status}`);
            return res.json();
         })
         .then((data) => {
            const processed = data.map((item) => ({
               ...item,
               price: Number(item.price),
               stock: Number(item.stock),
               discount: Number(item.discount),
               colors: item.colors || '',
               sizes: item.sizes || '',
            }));
            setProducts(processed);
         })
         .catch((err) => {
            console.error('Սխալ բեռնման ժամանակ:', err);
            alert('Անհաջող բեռնում՝ փորձեք կրկին');
         });
   };

   useEffect(() => {
      loadProducts();
   }, []);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]:
            name === 'price' || name === 'stock' || name === 'discount'
               ? value === ''
                  ? ''
                  : Number(value)
               : value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.name.trim()) {
         alert('Անունը պարտադիր է');
         return;
      }
      if (formData.price === '' || isNaN(formData.price)) {
         alert('Գինը պարտադիր է և պետք է լինի թիվ');
         return;
      }

      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('price', formData.price);
      form.append('stock', formData.stock || 0);
      form.append('discount', formData.discount || 0);
      form.append('colors', formData.colors.trim());
      form.append('sizes', formData.sizes.trim());

      const mainFile = mainImageRef.current?.files?.[0];
      const extra1 = extraImage1Ref.current?.files?.[0];
      const extra2 = extraImage2Ref.current?.files?.[0];

      if (mainFile) form.append('images', mainFile);
      if (extra1) form.append('images', extra1);
      if (extra2) form.append('images', extra2);

      const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;
      const method = isEditing ? 'PUT' : 'POST';

      try {
         const res = await fetch(url, {
            method,
            body: form,
         });

         if (!res.ok) throw new Error(`Սխալ: ${res.status}`);

         await loadProducts();
         setFormData({
            id: null,
            name: '',
            description: '',
            price: '',
            stock: '',
            discount: '',
            colors: '',
            sizes: '',
         });
         mainImageRef.current.value = '';
         extraImage1Ref.current.value = '';
         extraImage2Ref.current.value = '';
         setIsEditing(false);
      } catch (error) {
         console.error('Սխալ ապրանքի պահպանման ժամանակ:', error);
         alert('Սխալ ապրանքի պահպանման ժամանակ');
      }
   };

   const handleEdit = (product) => {
      setFormData({
         id: product.id,
         name: product.name,
         description: product.description || '',
         price: product.price,
         stock: product.stock,
         discount: product.discount,
         colors: product.colors,
         sizes: product.sizes,
      });
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleDelete = async (id) => {
      if (!window.confirm('Ջնջե՞լ այս ապրանքը։')) return;
      try {
         const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
         if (res.status === 404) {
            alert('Այս ապրանքը արդեն գոյություն չունի');
         } else if (!res.ok) {
            throw new Error(`Սխալ: ${res.status}`);
         }
         await loadProducts();
      } catch (error) {
         console.error('Ապրանքի ջնջման սխալ:', error);
         alert('Սխալ ապրանքի ջնջման ժամանակ');
      }
   };

   return (
      <div className={styles.container}>
         <h2>{isEditing ? 'Խմբագրել ապրանքը' : 'Ավելացնել ապրանք'}</h2>
         <form className={styles.form} onSubmit={handleSubmit}>
            <input name="name" placeholder="Անուն" value={formData.name} onChange={handleChange} required />
            <input name="description" placeholder="Նկարագիր" value={formData.description} onChange={handleChange} />
            <input name="price" placeholder="Գին" value={formData.price} onChange={handleChange} type="number" min="0" required />
            <input name="stock" placeholder="Պահեստի քանակ" value={formData.stock} onChange={handleChange} type="number" min="0" />
            <input name="discount" placeholder="Զեղչ (%)" value={formData.discount} onChange={handleChange} type="number" min="0" max="100" />
            <input name="colors" placeholder="Գույներ (բաժանված ստորակետով)" value={formData.colors} onChange={handleChange} />
            <input name="sizes" placeholder="Չափսեր (բաժանված ստորակետով, օրինակ XS,S,M)" value={formData.sizes} onChange={handleChange} />

            <label>Գլխավոր նկար:</label>
            <input type="file" ref={mainImageRef} accept="image/*" />
            <label>Լրացուցիչ նկար 1:</label>
            <input type="file" ref={extraImage1Ref} accept="image/*" />
            <label>Լրացուցիչ նկար 2:</label>
            <input type="file" ref={extraImage2Ref} accept="image/*" />

            <button type="submit">{isEditing ? 'Պահպանել' : 'Ավելացնել'}</button>
         </form>

         <div className={styles.list}>
            {products.length === 0 ? (
               <p>Ապրանքներ չկան</p>
            ) : (
               products.map((product) => (
                  <div key={product.id} className={styles.card}>
                     <img
                        src={product.main_image || 'https://placehold.co/150x150?text=No+Image'}
                        alt={product.name}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                     />
                     <div className={styles.info}>
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <strong>
                           Գին:{' '}
                           {product.discount > 0 ? (
                              <>
                                 <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>{product.price} ֏</span>
                                 <span style={{ color: '#EE4D31' }}>{Math.round(product.price * (1 - product.discount / 100))} ֏</span>
                              </>
                           ) : (
                              `${product.price} ֏`
                           )}
                        </strong>
                        <p>Զեղչ: {product.discount}%</p>
                        <p>Պահեստում է: {product.stock}</p>
                        <p>Գույներ: {product.colors || '-'}</p>
                        <p>Չափսեր: {product.sizes || '-'}</p>
                     </div>
                     <div className={styles.actions}>
                        <button onClick={() => handleEdit(product)} title="Խմբագրել">✏️</button>
                        <button onClick={() => handleDelete(product.id)} title="Ջնջել">🗑️</button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default AdminPage;
