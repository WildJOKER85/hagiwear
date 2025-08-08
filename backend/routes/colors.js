const express = require('express');
const router = express.Router();

// Пример: отдаём список доступных цветов
router.get('/', (req, res) => {
   const colors = [
      { value: 'white', label: 'Սպիտակ' },
      { value: 'black', label: 'Սև' },
      { value: 'red', label: 'Կարմիր' },
      { value: 'blue', label: 'Կապույտ' },
      { value: 'yellow', label: 'Դեղին' },
      { value: 'green', label: 'Կանաչ' },
   ];
   res.json(colors);
});

module.exports = router;
