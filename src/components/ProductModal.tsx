// components/ProductModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography } from "@mui/material";
import { Product } from "@/types/Product";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [product, setProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    fromList: "available",
  });

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    } else {
      setProduct({ id: Date.now(), name: "", price: 0, fromList: "available" });
    }
  }, [initialProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(product);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          margin: "auto",
          marginTop: "10%",
          borderRadius: 2,
          width: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {initialProduct ? "EDIT PRODUCT" : "NEW PRODUCT"}
        </Typography>
        <TextField
          fullWidth
          label="ID"
          name="id"
          value={product.id}
          onChange={handleChange}
          margin="normal"
          type="number"
          disabled={!!initialProduct} // Disable editing ID for existing products
        />
        <TextField
          fullWidth
          label="Όνομα"
          name="name"
          value={product.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Τιμή"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          margin="normal"
        />
        <button
          onClick={handleSave}
          className="bg-[#00d6d6] p-2 rounded-lg w-full uppercase text-white font-bold"
        >
          Αποθηκευση
        </button>
      </Box>
    </Modal>
  );
};

export default ProductModal;
