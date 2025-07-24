const API_BASE_URL = 'http://localhost:10000/api/cart';

// 🔄 Обновить количество
export const updateQuantityOnServer = async ({ userId, productId, size, quantity }) => {
   const res = await fetch(`${API_BASE_URL}/update-quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, size, quantity }),
   });
   if (!res.ok) throw new Error('Ошибка обновления количества');
   return await res.json();
};

// ❌ Удалить товар
export const removeFromCartOnServer = async ({ userId, productId, size }) => {
   const res = await fetch(`${API_BASE_URL}/${userId}/${productId}/${size}`, {
      method: 'DELETE',
   });
   if (!res.ok) throw new Error('Ошибка удаления товара');
   return await res.json();
};
