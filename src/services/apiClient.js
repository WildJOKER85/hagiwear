// Автоматически подставляем протокол и хост из текущего окна,
// а порт — ставим в переменную (можно менять в одном месте)
const API_PORT = 10000;

const API_URL = `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api/products`;

export const getProducts = async () => {
   const res = await fetch(API_URL);
   if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
   return await res.json();
};

export const createProduct = async (product) => {
   const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
   });
   if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
   return await res.json();
};

export const updateProduct = async (id, product) => {
   const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
   });
   if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
   return await res.json();
};

export const deleteProduct = async (id) => {
   const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
   });
   if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
   return await res.json();
};
