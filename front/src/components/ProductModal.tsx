import React from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null; // Сделаем обязательным
  sku: string;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => void;
  initialValues?: ProductFormValues;
}

// Сделаем все поля обязательными в схеме Yup
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().required('Price is required').min(0, 'Price must be a positive number'),
  discountedPrice: yup
    .number()
    .required('Discounted Price is required')
    .min(0, 'Discounted price must be a positive number')
    .nullable(),
  sku: yup.string().required('SKU is required'),
});

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: initialValues || {
      name: '',
      description: '',
      price: 0,
      discountedPrice: null, // Установим null по умолчанию
      sku: '',
    },
    // @ts-expect-error: Я хз как фиксить....
    resolver: yupResolver(schema),
  });

  // Сброс формы при открытии/закрытии модала
  React.useEffect(() => {
    if (open) {
      reset(initialValues || {
        name: '',
        description: '',
        price: 0,
        discountedPrice: null, // Установим null по умолчанию
        sku: '',
      });
    }
  }, [open, reset, initialValues]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {initialValues ? 'Edit Product' : 'Create Product'}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          />
          <Controller
            name="discountedPrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Discounted Price"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.discountedPrice}
                helperText={errors.discountedPrice?.message}
              />
            )}
          />
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="SKU"
                fullWidth
                margin="normal"
                error={!!errors.sku}
                helperText={errors.sku?.message}
              />
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {initialValues ? 'Save' : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};
