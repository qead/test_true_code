const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function createProduct() {
  try {
    // Создаем объект FormData
    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('description', 'This is a test product.');
    form.append('price', '100.50');
    form.append('discountedPrice', '90.00');
    form.append('sku', 'TEST12345');
    form.append('photo', fs.createReadStream('./path/to/your/photo.jpg')); // Укажите путь к файлу

    // Отправляем POST-запрос
    const response = await axios.post('http://localhost:3000/products', form, {
      headers: form.getHeaders(),
    });

    console.log('Product created successfully:', response.data);
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
  }
}

createProduct();
