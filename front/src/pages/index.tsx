import { useEffect, useState, useRef  } from 'react';
import { GetServerSideProps } from 'next';
import { Product } from '@/components/Product';
import { ProductModal } from '@/components/ProductModal';
import axios from 'axios';
import Layout from '@/components/Layout';
import Head from 'next/head';
import {  
  Box, Typography, Select, MenuItem, InputLabel, FormControl,
  TextField,Button, Grid2, Pagination, SelectChangeEvent  } from '@mui/material';
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  sku: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServerResponse {
  data: Product[];
  total: number;
  page: number;
  pages: number;
}

interface Props {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

const PAGE_LIMIT = 3;

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.BACK_URL||'http://localhost:3000/'}products?limit=${PAGE_LIMIT}`);
  const data: ServerResponse = await res.json();
  return {
    props: {
      products: data.data,
      total: data.total,
      page: data.page,
      pages: data.pages,
    },
  };
};
export default function Home({ products, total, page, pages }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productData, setProductData] = useState<Props>({ products, total, page, pages });
  const [currentPage, setCurrentPage] = useState(page);
  const [order, setOrder] = useState<string>('');
  const [sort, setSort] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  
  const filterTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCreate = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  useEffect(() => {
    getData();
    if (filterTimeout.current) clearTimeout(filterTimeout.current);
    // Добавляем задержку для debounce
    filterTimeout.current = setTimeout(() => {
      getData();
    }, 500);
  
    return () => {
      // Очищаем таймаут, если состояние обновляется до завершения таймера
      if (filterTimeout.current) clearTimeout(filterTimeout.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sort, order, filter]);

  const getData = async (pageOverride?: number) => {
    const page = pageOverride || currentPage;
    try {
      const res = await fetch(
        `${process.env.BACK_URL||'http://localhost:3000/'}products?limit=${PAGE_LIMIT}&page=${page}&sort=${sort}&order=${order}&name=${filter}`
      );
      console.log( ` ------ FETCH ITH QUERY ${process.env.BACK_URL||'http://localhost:3000/'}products?limit=${PAGE_LIMIT}&page=${page}&sort=${sort}&order=${order}&name=${filter}`)
      const data: ServerResponse = await res.json();
      setProductData({
        products: data.data,
        total: data.total,
        page: data.page,
        pages: data.pages,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFilter(value);
  };
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const [sortField, sortOrder] = event.target.value.split("_");
    setSort(sortField);
    setOrder(sortOrder as "ASC" | "DESC");
    // setCurrentPage(1); // Сбрасываем страницу на первую
    // getData(1); // Вызываем getData с первой страницей
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // getData(value);
  };
  

  const handleModalSubmit = async (data: Product) => {
    try {
      if (editProduct) {
        await axios.put(`${process.env.BACK_URL||'http://localhost:3000/'}products/${editProduct.id}`, data);
      } else {
        await axios.post(`${process.env.BACK_URL||'http://localhost:3000/'}products`, data);
      }
      getData();
      setModalOpen(false);
    } catch (error) {
      console.error('Error during update/create:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.BACK_URL||'http://localhost:3000/'}products/${id}`);
      getData();
    } catch (error) {
      console.error('Error during DELETE request:', error);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Тестовое задание - TRUE_CODE</title>
        <meta name="description" content="Тестовое задание по разработке базового функционала e-commerce на nextjs" />
        <meta property="og:title" content="Тестовое задание - TRUE_CODE" />
        <meta property="og:description" content="Тестовое задание по разработке базового функционала e-commerce на nextjs" />
        <meta property="og:url" content={`/`} />
      </Head>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          True Code All Products
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create Product
        </Button>
        <TextField
          label="Search by name"
          variant="outlined"
          margin="normal"
          value={filter}
          onChange={handleFilterChange}
        />
        <FormControl margin="normal">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={`${sort}_${order}`}
            onChange={handleSortChange}
            displayEmpty
          >
            <MenuItem value="createdAt_ASC">Date: Oldest First</MenuItem>
            <MenuItem value="createdAt_DESC">Date: Newest First</MenuItem>
            <MenuItem value="price_ASC">Price: Low to High</MenuItem>
            <MenuItem value="price_DESC">Price: High to Low</MenuItem>
            <MenuItem value="name_ASC">Name: A to Z</MenuItem>
            <MenuItem value="name_DESC">Name: Z to A</MenuItem>
          </Select>
        </FormControl>
        {productData.pages > 1 ? (
          <Pagination
            count={productData.pages}
            page={currentPage}
            shape="rounded"
            sx={{ my: 2 }}
            onChange={handlePageChange}
          />
        ) : null}
        <ProductModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialValues={editProduct || undefined}
        />
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Products: {productData.total} | Page: {productData.page} of {productData.pages}
        </Typography>
        <Grid2 container spacing={2}>
          {productData?.products?.length ? (
            productData.products.map((data) => (
              <Grid2 size={4} minWidth={200} key={data.id}>
                <Product
                  {...data}
                  onEdit={() => handleEdit(data)}
                  onDelete={() => handleDelete(data.id)}
                />
              </Grid2>
            ))
          ) : (
            <Typography variant="body1" sx={{ mb: 2 }}>
              Products not found
            </Typography>
          )}
        </Grid2>
      </Box>
    </Layout>
  );
}
