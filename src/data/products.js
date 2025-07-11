const products = [
   {
      id: 0,
      name: 'Շապիկ «Ազդեցիկ» Սպիտակ',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 5,
      images: [
         '/hagiwear/images/product0/main.jpg',
         '/hagiwear/images/product0/1.jpg',
         '/hagiwear/images/product0/2.jpg'
      ],
      sizes: {
         XS: 3,
         S: 0,
         M: 2,
         L: 1,
         XL: 0,
         XXL: 0
      }
   },
   {
      id: 1,
      name: 'Շապիկ «Ազդեցիկ» Սև',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 0,
      images: [
         '/hagiwear/images/product1/main.jpg',
         '/hagiwear/images/product1/1.jpg',
         '/hagiwear/images/product1/2.jpg'
      ],
      sizes: {
         XS: 1,
         S: 1,
         M: 1,
         L: 1,
         XL: 0,
         XXL: 0
      }
   },
   {
      id: 2,
      name: 'Շապիկ «Սրամիտ» Սև',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 2,
      images: [
         '/hagiwear/images/product2/main.jpg',
         '/hagiwear/images/product2/1.jpg',
         '/hagiwear/images/product2/2.jpg'
      ],
      sizes: {
         XS: 1,
         S: 1,
         M: 3,
         L: 1,
         XL: 0,
         XXL: 1
      }
   },
   {
      id: 3,
      name: 'Շապիկ «Սրամիտ» Սպիտակ',
      image: '/hagiwear/images/product4.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 5,
      images: [
         '/hagiwear/images/product3/main.jpg',
         '/hagiwear/images/product3/1.jpg',
         '/hagiwear/images/product3/2.jpg'
      ],
      sizes: {
         XS: 3,
         S: 1,
         M: 3,
         L: 1,
         XL: 1,
         XXL: 2
      }
   },
   {
      id: 4,
      name: 'Շապիկ «Ոճային» Սպիտակ',
      image: '/hagiwear/images/product5.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 4,
      images: [
         '/hagiwear/images/product4/main.jpg',
         '/hagiwear/images/product4/1.jpg',
         '/hagiwear/images/product4/2.jpg'
      ],
      sizes: {
         XS: 2,
         S: 1,
         M: 0,
         L: 1,
         XL: 1,
         XXL: 0
      }
   },
   {
      id: 5,
      name: 'Շապիկ «Ուրախ» Սպիտակ',
      image: '/hagiwear/images/product6.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 3,
      images: [
         '/hagiwear/images/product5/main.jpg',
         '/hagiwear/images/product5/1.jpg',
         '/hagiwear/images/product5/2.jpg'
      ],
      sizes: {
         XS: 1,
         S: 1,
         M: 0,
         L: 0,
         XL: 2,
         XXL: 0
      }
   },
   {
      id: 6,
      name: 'Շապիկ «Հպարտ» Սև',
      image: '/hagiwear/images/product7.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 4,
      images: [
         '/hagiwear/images/product6/main.jpg',
         '/hagiwear/images/product6/1.jpg',
         '/hagiwear/images/product6/2.jpg'
      ],
      sizes: {
         XS: 0,
         S: 1,
         M: 0,
         L: 1,
         XL: 2,
         XXL: 0
      }
   },
   {
      id: 7,
      name: 'Շապիկ «Պաշտելի» Սպիտակ',
      image: '/hagiwear/images/product8.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 6,
      images: [
         '/hagiwear/images/product7/main.jpg',
         '/hagiwear/images/product7/1.jpg',
         '/hagiwear/images/product7/2.jpg'
      ],
      sizes: {
         XS: 1,
         S: 1,
         M: 1,
         L: 1,
         XL: 4,
         XXL: 0
      }
   },
   {
      id: 8,
      name: 'Շապիկ «Կոկիկ» Սև',
      image: '/hagiwear/images/product9.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 2,
      images: [
         '/hagiwear/images/product8/main.jpg',
         '/hagiwear/images/product8/1.jpg',
         '/hagiwear/images/product8/2.jpg'
      ],
      sizes: {
         XS: 1,
         S: 2,
         M: 1,
         L: 0,
         XL: 1,
         XXL: 0
      }
   },
   {
      id: 9,
      name: 'Շապիկ «Խիզախ» Սպիտակ',
      image: '/hagiwear/images/product10.jpg',
      price: '9 900 AMD',
      description: 'Նոր անուն, նոր խոսք, նոր ձև',
      stock: 3,
      images: [
         '/hagiwear/images/product9/main.jpg',
         '/hagiwear/images/product9/1.jpg',
         '/hagiwear/images/product9/2.jpg'
      ],
      sizes: {
         XS: 2,
         S: 0,
         M: 1,
         L: 1,
         XL: 0,
         XXL: 0
      }
   }
];

export default products;



