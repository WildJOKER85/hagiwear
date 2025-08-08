const express = require('express');
const router = express.Router();

// Пример: возвращаем список размеров
router.get('/', (req, res) => {
   const sizes = [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
   ];
   res.json(sizes);
});

module.exports = router;
