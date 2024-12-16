import React from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Link from '@/components/Link';

interface ProductProps {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  sku: string;
  photo?: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const Product: React.FC<ProductProps> = ({
  id,
  name,
  description,
  price,
  discountedPrice,
  photo,
  sku,
  onEdit,
  onDelete,
}) => {
  return (<Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="140"
        image={`${process.env.BACK_URL||'http://localhost:3000/'}${photo||'uploads/default.png'}`}
      />
      <CardContent>
        
      <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
      <strong>Price:</strong> {price}$
      </Typography>
      <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
        <strong>Discounted Price:</strong> ${discountedPrice?.toFixed(2)}
      </Typography>
        <Typography gutterBottom variant="h5" component="div">
            <strong>Name:</strong> {name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>Description:</strong> {description}
        </Typography>
      <Typography variant="body2">
        <strong>SKU:</strong> {sku}
      </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onEdit(id)}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
        <Link href={`/product/${id}`} color="primary">
            Open
        </Link>
      </CardActions>
    </Card>
  );
};