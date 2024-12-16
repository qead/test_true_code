// pages/product/[id].tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { Box, Container, Typography } from '@mui/material';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Image from 'next/image';

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    sku: string;
    photo: string;
  };
}

const ProductPage = ({ product }: ProductProps) => {
  return (
  <Layout>
      <Head>
        <title>{product.name} - TRUE_CODE</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={`${process.env.BACK_URL||'http://localhost:3000/'}${product.photo || '/default-image.jpg'}`}/>
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`/products/${product.id}`} />
      </Head>
    {product.id?<Container maxWidth="lg">
    <Box
       sx={{
         my: 12,
         display: 'flex',
         flexDirection: 'row',
         flexWrap:'wrap',
         justifyContent: 'center',
         alignItems: 'center',
       }}
     ><Image src={`${process.env.BACK_URL||'http://localhost:3000/'}${product.photo||'uploads/default.png'}`} alt="" style={{maxWidth:"400px",margin:"20px 20px 0 0", minWidth:'200px'}}/>
     <Box
       sx={{
         my: 4,
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'center',
         alignItems: 'center',
       }}
     >
     <div>
       <h1>Название: {product.name}</h1>
       <p>Описание:{product.description}</p>
       <p>Цена: ${product.price}</p>
       <p>Цена со скидкой: ${product.discountedPrice}</p>
       <p>Артикул: {product.sku}</p>
     </div>
     </Box>
     </Box>
     </Container>
     :<Typography variant="body1" sx={{ mb: 2 }}>
      Product not found
    </Typography>}
  </Layout>
  );
};

// Получение данных продукта по ID
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!; // Достаем ID продукта из URL
  
  // Здесь вы можете получить данные с API или из базы данных
  const product = await fetch(`${process.env.BACK_URL||'http://localhost:3000/'}products/${id}`)
    .then((res) => res.json())
    .catch(() => null);

  if (!product) {
    return {
      notFound: true, // В случае, если продукт не найден
    };
  }

  return {
    props: {
      product, // Передаем данные продукта в компонент
    },
  };
};

export default ProductPage;