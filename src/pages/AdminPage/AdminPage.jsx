import { useEffect, useState } from 'react';
import styles from './AdminPage.module.css';

const API_URL = 'http://localhost:10000/api/products';

const AdminPage = () => {
   const [products, setProducts] = useState([]);
   const [formData, setFormData] = useState({
      id: null,
      name: '',
      description: '',
      price: '',
      stock: 0,
   });
   const [isEditing, setIsEditing] = useState(false);

   // Загрузка товаров с принудительным отключением кеша
   const loadProducts = () => {
      fetch(`${API_URL}?t=${Date.now()}`)
         .then((res) => {
            if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
            return res.json();
         })
         .then((data) => {
            // Приводим price и stock к числам
            const processed = data.map((item) => ({
               ...item,
               price: Number(item.price),
               stock: Number(item.stock),
            }));
            console.log('Товары с сервера (приведенные к числам):', processed);
            setProducts(processed);
         })
         .catch((err) => console.error('Ошибка загрузки:', err));
   };

   useEffect(() => {
      loadProducts();
   }, []);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: name === 'price' || name === 'stock' ? (value === '' ? '' : Number(value)) : value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      const dataToSend = {
         name: formData.name.trim(),
         description: formData.description.trim(),
         price: Number(formData.price) || 0,
         stock: Number(formData.stock) || 0,
      };

      const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;
      const method = isEditing ? 'PUT' : 'POST';

      try {
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
         });

         if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

         const responseData = await res.json();
         console.log('Ответ сервера при обновлении/добавлении:', responseData);

         // Заново загружаем товары
         await loadProducts();

         // Сбрасываем форму
         setFormData({ id: null, name: '', description: '', price: '', stock: 0 });
         setIsEditing(false);
      } catch (error) {
         console.error('Ошибка отправки данных:', error);
         alert('Ошибка при сохранении товара');
      }
   };

   const handleEdit = (product) => {
      setFormData({
         id: product.id,
         name: product.name,
         description: product.description || '',
         price: product.price,
         stock: product.stock,
      });
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleDelete = async (id) => {
      if (!window.confirm('Удалить этот товар?')) return;

      try {
         const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
         if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

         await loadProducts();
      } catch (error) {
         console.error('Ошибка удаления товара:', error);
         alert('Ошибка при удалении товара');
      }
   };

   console.log('Текущий стейт products:', products);

   return (
      <div className={styles.container}>
         <h2>{isEditing ? 'Редактировать товар' : 'Добавить товар'}</h2>
         <form className={styles.form} onSubmit={handleSubmit}>
            <input
               name="name"
               placeholder="Название"
               value={formData.name}
               onChange={handleChange}
               required
            />
            <input
               name="description"
               placeholder="Описание"
               value={formData.description}
               onChange={handleChange}
            />
            <input
               name="price"
               placeholder="Цена"
               value={formData.price}
               onChange={handleChange}
               type="number"
               min="0"
               step="0.01"
               required
            />
            <input
               name="stock"
               placeholder="Количество на складе"
               value={formData.stock}
               onChange={handleChange}
               type="number"
               min="0"
            />
            <button type="submit">{isEditing ? 'Сохранить' : 'Добавить'}</button>
         </form>

         <div className={styles.list}>
            {products.length === 0 ? (
               <p>Товары отсутствуют</p>
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
                        <strong>{product.price} ֏</strong>
                        <p>В наличии: {product.stock}</p>
                     </div>
                     <div className={styles.actions}>
                        <button onClick={() => handleEdit(product)}>✏️</button>
                        <button onClick={() => handleDelete(product.id)}>🗑️</button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default AdminPage;
