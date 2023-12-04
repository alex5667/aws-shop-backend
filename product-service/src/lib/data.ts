import { IProduct, IStock } from '../utils/interfaces';

export const productData: IProduct[] = [
  {
    id: '1',
    title: 'Lenovo IdeaPad L3',
    description:
      'Powerful laptop with FHD display, stereo speakers, and long battery life. Ideal for work, school, and entertainment.',
    price: 930,
  },
  {
    id: '2',
    title: 'IPhone 9',
    description:
      'Classic design with a thicker body for a larger battery. Features a 64GB storage, 6-core A13 Bionic processor, and iOS 13.',
    price: 256,
  },
  {
    id: '3',
    title: 'IPhone X',
    description:
      'Apple IPhone X with bezel-less design, glass-metal body, and 6-core A11 Bionic processor for enhanced speed and efficiency.',
    price: 381,
  },
  {
    id: '4',
    title: 'Iiyama ProLite',
    description:
      'Stylish edge-to-edge monitor with IPS panel, 4K resolution, and adjustable stand for optimal viewing experience.',
    price: 697,
  },
  {
    id: '5',
    title: 'Oppo A53',
    description:
      'Ultra-thin Oppo A53 with 90Hz display, large 5000mAh battery, and efficient Qualcomm Snapdragon processor.',
    price: 201,
  },
  {
    id: '6',
    title: 'Huawei Matebook X Pro',
    description:
      'Huawei MateBook X Pro with touch screen, Intel Core i7 processor, NVIDIA GeForce MX250, and 16GB RAM for powerful performance.',
    price: 1075,
  },
  {
    id: '7',
    title: 'Apple MacBook Pro M2',
    description:
      'Professional 13-inch MacBook Pro with M2 chip, Retina display, and up to 20 hours of battery life for enhanced productivity.',
    price: 1375,
  },
  {
    id: '8',
    title: 'Samsung Galaxy Book Pro',
    description:
      'Samsung Galaxy Book Pro with AMOLED display, wireless connection features, and SmartThings integration for seamless control.',
    price: 899,
  },
  {
    id: '9',
    title: 'Apple iPhone 14',
    description:
      'Durable iPhone 14 with aerospace-grade aluminum body, Ceramic Shield display, and A15 Bionic processor for superior performance.',
    price: 1087,
  },
  {
    id: '10',
    title: 'Apple iPad 10',
    description:
      'All-new iPad with 10.9-inch Liquid Retina display, A14 Bionic chip, and Apple Pencil support for versatile productivity.',
    price: 847,
  },
  {
    id: '11',
    title: 'HP Victus 16-e0151ur',
    description:
      'HP Victus 16 gaming laptop with 16.1-inch screen, AMD Ryzen 5 5600H processor, and NVIDIA GeForce RTX 3050 for immersive gaming.',
    price: 1099,
  },
  {
    id: '12',
    title: 'Realme 9 Pro+',
    description:
      'Realme 9 Pro+ smartphone with 50+8+4MP cameras, Super AMOLED display, and 4500mAh battery for a great mobile experience.',
    price: 368,
  },
  {
    id: '13',
    title: 'Xiaomi Redmi Watch 2',
    description:
      'Xiaomi Redmi Watch 2 with 100+ workout modes, multiple watch faces, and trendy design for fitness enthusiasts.',
    price: 70,
  },
  {
    id: '14',
    title: 'Huawei MatePad Pro',
    description:
      'Huawei MatePad Pro with nature-inspired color design, compact and lightweight build, and hidden antenna for a sleek look.',
    price: 707,
  },
  {
    id: '15',
    title: 'MSI Pro AP241',
    description:
      'MSI Pro AP241 All-in-One PC with powerful processing, ergonomic 23.8-inch screen, and anti-flicker technology for enhanced comfort.',
    price: 1681,
  },
];

export const stockData: IStock[] = [
  { product_id: '1', count: 9 },
  { product_id: '2', count: 14 },
  { product_id: '3', count: 7 },
  { product_id: '4', count: 1 },
  { product_id: '5', count: 15 },
  { product_id: '6', count: 8 },
  { product_id: '7', count: 5 },
  { product_id: '8', count: 12 },
  { product_id: '9', count: 3 },
  { product_id: '10', count: 18 },
  { product_id: '11', count: 7 },
  { product_id: '12', count: 22 },
  { product_id: '13', count: 2 },
  { product_id: '14', count: 6 },
  { product_id: '15', count: 30 },
];
