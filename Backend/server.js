const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

// In-memory database
const store = {
  products: [
    {
      id: '1',
      name: 'Black and Gray Athletic Cotton Socks - 6 Pairs',
      image: 'images/products/athletic-cotton-socks-6-pairs.jpg',
      priceCents: 1090,
      rating: { stars: 4.5, count: 87 },
      keywords: ['socks', 'cotton', 'athletic']
    },
    {
      id: '2',
      name: 'Intermediate Size Basketball',
      image: 'images/products/intermediate-composite-basketball.jpg',
      priceCents: 2095,
      rating: { stars: 4, count: 127 },
      keywords: ['sports', 'basketball', 'ball']
    },
    {
      id: '3',
      name: 'Korean Red Ginseng Supplement',
      image: 'images/products/laundry-detergent-tabs.jpg',
      priceCents: 3499,
      rating: { stars: 4.8, count: 192 },
      keywords: ['supplement', 'health', 'wellness']
    },
    {
      id: '4',
      name: 'Wireless Bluetooth Headphones',
      image: 'images/products/round-sunglasses-gold.jpg',
      priceCents: 4999,
      rating: { stars: 4.6, count: 342 },
      keywords: ['headphones', 'wireless', 'audio', 'bluetooth']
    },
    {
      id: '5',
      name: 'Stainless Steel Water Bottle',
      image: 'images/products/electric-steel-hot-water-kettle-white.jpg',
      priceCents: 2499,
      rating: { stars: 4.7, count: 156 },
      keywords: ['water bottle', 'stainless steel', 'hydration']
    },
    {
      id: '6',
      name: 'Yoga Mat with Carrying Strap',
      image: 'images/products/bathroom-mat.jpg',
      priceCents: 1999,
      rating: { stars: 4.4, count: 203 },
      keywords: ['yoga', 'mat', 'exercise', 'fitness']
    },
    {
      id: '7',
      name: 'Portable Phone Charger 20000mAh',
      image: 'images/products/black-and-silver-espresso-maker.jpg',
      priceCents: 2999,
      rating: { stars: 4.5, count: 278 },
      keywords: ['power bank', 'charger', 'portable', 'phone']
    },
    {
      id: '8',
      name: 'USB-C Lightning Cable 6ft',
      image: 'images/products/glass-screw-lid-food-containers.jpg',
      priceCents: 799,
      rating: { stars: 4.3, count: 445 },
      keywords: ['cable', 'usb-c', 'charging', 'accessories']
    },
    {
      id: '9',
      name: 'Adjustable Dumbbell Set 10-50 lbs',
      image: 'images/products/non-stick-cooking-set-4-pieces.jpg',
      priceCents: 29999,
      rating: { stars: 4.8, count: 521 },
      keywords: ['dumbbell', 'weights', 'fitness', 'gym']
    },
    {
      id: '10',
      name: 'Smart Watch Fitness Tracker',
      image: 'images/products/vanity-mirror-pink.jpg',
      priceCents: 15999,
      rating: { stars: 4.6, count: 387 },
      keywords: ['smartwatch', 'fitness', 'tracker', 'health']
    },
    {
      id: '11',
      name: 'Running Shoes - Professional Grade',
      image: 'images/products/men-athletic-shoes-white.jpg',
      priceCents: 9999,
      rating: { stars: 4.7, count: 634 },
      keywords: ['shoes', 'running', 'athletic', 'footwear']
    },
    {
      id: '12',
      name: 'Gym Towel Set - 3 Pack',
      image: 'images/products/luxury-towel-set.jpg',
      priceCents: 1899,
      rating: { stars: 4.4, count: 178 },
      keywords: ['towel', 'gym', 'microfiber', 'sports']
    },
    {
      id: '13',
      name: 'Wireless Earbuds with Charging Case',
      image: 'images/products/men-navigator-sunglasses-black.jpg',
      priceCents: 3999,
      rating: { stars: 4.5, count: 423 },
      keywords: ['earbuds', 'wireless', 'audio', 'bluetooth']
    },
    {
      id: '14',
      name: 'Laptop Stand Aluminum Foldable',
      image: 'images/products/countertop-push-blender-black.jpg',
      priceCents: 2799,
      rating: { stars: 4.6, count: 289 },
      keywords: ['laptop stand', 'computer', 'desk', 'ergonomic']
    },
    {
      id: '15',
      name: 'USB Hub 7-Port Multi-Device',
      image: 'images/products/kitchen-paper-towels-8-pack.jpg',
      priceCents: 1999,
      rating: { stars: 4.3, count: 156 },
      keywords: ['usb hub', 'port', 'adapter', 'connectivity']
    },
    {
      id: '16',
      name: 'Ergonomic Computer Mouse',
      image: 'images/products/sky-leaf-branch-earrings.jpg',
      priceCents: 2499,
      rating: { stars: 4.5, count: 312 },
      keywords: ['mouse', 'computer', 'wireless', 'ergonomic']
    },
    {
      id: '17',
      name: 'Mechanical Keyboard RGB Backlit',
      image: 'images/products/artistic-bowl-set-6-piece.jpg',
      priceCents: 8999,
      rating: { stars: 4.7, count: 478 },
      keywords: ['keyboard', 'mechanical', 'gaming', 'rgb']
    },
    {
      id: '18',
      name: 'Webcam 1080p HD with Microphone',
      image: 'images/products/blackout-curtain-set-beige.jpg',
      priceCents: 3499,
      rating: { stars: 4.4, count: 267 },
      keywords: ['webcam', 'camera', 'video', 'stream']
    },
    {
      id: '19',
      name: 'Desk Lamp LED Adjustable',
      image: 'images/products/elegant-white-dinner-plate-set.jpg',
      priceCents: 2299,
      rating: { stars: 4.5, count: 223 },
      keywords: ['lamp', 'light', 'desk', 'led']
    },
    {
      id: '20',
      name: 'Monitor Stand Riser with Storage',
      image: 'images/products/blackout-curtains-set-teal.jpg',
      priceCents: 3999,
      rating: { stars: 4.6, count: 198 },
      keywords: ['monitor stand', 'desk', 'storage', 'organization']
    }
  ],
  cart: [],
  orders: [],
  deliveryOptions: [
    { id: '1', deliveryDays: 7, priceCents: 0 },
    { id: '2', deliveryDays: 3, priceCents: 999 },
    { id: '3', deliveryDays: 1, priceCents: 2999 }
  ]
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Products
app.get('/api/products', (req, res) => {
  const { search } = req.query;
  let products = store.products;

  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.keywords.some(k => k.toLowerCase().includes(searchLower))
    );
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Cart
app.get('/api/cart-items', (req, res) => {
  const cartWithProducts = store.cart.map(item => ({
    ...item,
    product: store.products.find(p => p.id === item.productId)
  }));
  res.json(cartWithProducts);
});

app.post('/api/cart-items', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId required' });
  }

  const existing = store.cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    store.cart.push({ productId, quantity, id: Date.now().toString() });
  }

  res.status(201).json(store.cart);
});

app.put('/api/cart-items/:productId', (req, res) => {
  const { quantity } = req.body;
  const item = store.cart.find(i => i.productId === req.params.productId);

  if (!item) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  item.quantity = quantity;
  res.json(item);
});

app.delete('/api/cart-items/:productId', (req, res) => {
  const index = store.cart.findIndex(i => i.productId === req.params.productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  store.cart.splice(index, 1);
  res.json({ message: 'Item removed' });
});

// Delivery Options
app.get('/api/delivery-options', (req, res) => {
  res.json(store.deliveryOptions);
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json(store.orders);
});

app.post('/api/orders', (req, res) => {
  const { deliveryOptionId } = req.body;

  if (store.cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const deliveryOption = store.deliveryOptions.find(d => d.id === deliveryOptionId);
  if (!deliveryOption) {
    return res.status(404).json({ error: 'Delivery option not found' });
  }

  const items = store.cart.map(item => {
    const product = store.products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceCents: product?.priceCents || 0
    };
  });

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryOption.deliveryDays);

  const order = {
    id: Date.now().toString(),
    items,
    deliveryOptionId,
    estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  store.orders.push(order);
  store.cart = [];

  res.status(201).json(order);
});

app.get('/api/orders/:id', (req, res) => {
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Payment Summary
app.get('/api/payment-summary', (req, res) => {
  const { deliveryOptionId } = req.query;

  const productSubtotal = store.cart.reduce((sum, item) => {
    const product = store.products.find(p => p.id === item.productId);
    return sum + (product?.priceCents || 0) * item.quantity;
  }, 0);

  let shippingCents = 0;
  if (deliveryOptionId) {
    const option = store.deliveryOptions.find(d => d.id === deliveryOptionId);
    shippingCents = option?.priceCents || 0;
  }

  const estimatedTaxCents = Math.round(productSubtotal * 0.1);
  const totalCents = productSubtotal + shippingCents + estimatedTaxCents;

  res.json({
    productSubtotal,
    shippingCents,
    estimatedTaxCents,
    totalCents,
    itemCount: store.cart.length
  });
});

// Reset
app.post('/api/reset', (req, res) => {
  store.cart = [];
  store.orders = [];
  res.json({ message: 'Reset successful' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ CORS enabled for ${CORS_ORIGIN}\n`);
});
