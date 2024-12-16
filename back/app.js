const express = require('express');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const cors = require('cors');


const app = express();

// const sequelize = new Sequelize('product_db', 'user', 'password', {
//   host: 'localhost',
//   dialect: 'postgres',
// });
const databaseUrl = process.env.DATABASE_URL||'postgres://user:password@localhost:5432/product_db';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: true,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  discountedPrice: { type: DataTypes.FLOAT },
  sku: { type: DataTypes.STRING, unique: true, allowNull: false },
  photo: { type: DataTypes.STRING },
});

(async () => {
  await sequelize.sync({ force: true });
  console.log('Database synced');
})();

// Routes
app.get('/',async (req, res) => {res.end('test')});
// Create a product
app.post('/products', upload.single('photo'), async (req, res) => {
  try {
    const { name, description, price, discountedPrice, sku } = req.body;
    const photo = req.file ? req.file.path : null;

    const product = await Product.create({
      name,
      description,
      price,
      discountedPrice,
      sku,
      photo,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products with pagination, filtering, and sorting
app.get('/products', async (req, res) => {
  try {
    // Дефолтные значения для параметров
    let { page = 1, limit = 10, sort = 'createdAt', order = 'ASC', name, priceMin, priceMax } = req.query;

    // Преобразование параметров в числа
    page = parseInt(page);
    limit = parseInt(limit);
    priceMin = priceMin ? parseFloat(priceMin) : undefined;
    priceMax = priceMax ? parseFloat(priceMax) : undefined;

    // Если сортировка не указана, использовать значение по умолчанию
    if (!sort) sort = 'createdAt'; 
    // Если порядок сортировки не указан, использовать значение по умолчанию
    if (!order) order = 'ASC'; 

    // Формируем условия поиска
    const where = {};

    if (name) {
      where.name = { [Sequelize.Op.like]: `%${name}%` };
    }
    if (priceMin) {
      where.price = { ...where.price, [Sequelize.Op.gte]: priceMin };
    }
    if (priceMax) {
      where.price = { ...where.price, [Sequelize.Op.lte]: priceMax };
    }

    const products = await Product.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [[sort, order]],
    });

    res.status(200).json({
      data: products.rows,
      total: products.count,
      page,
      pages: Math.ceil(products.count / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single product
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product
app.put('/products/:id', upload.single('photo'), async (req, res) => {
  try {
    console.log('✌️Update a product --->');
    const { name, description, price, discountedPrice, sku } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const photo = req.file ? req.file.path : product.photo;
    await product.update({ name, description, price, discountedPrice, sku, photo });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.photo) {
      const fs = require('fs');
      fs.unlinkSync(product.photo);
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
