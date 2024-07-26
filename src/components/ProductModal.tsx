import React, { useState, useEffect, useRef } from "react";
import { TextField } from "@mui/material";
import { Product } from "@/types/Product";
import Image from "next/image";

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

  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="animate-fade-up animate-once animate-duration-500 animate-ease-in-out w-80 rounded-lg bg-white p-8"
      >
        <div className="mb-5 flex items-center gap-2">
          <Image
            src={"/images/mysuper.png"}
            alt="My Super Image"
            width={50}
            height={50}
          />
          <h6 className="text-xl font-bold">
            {initialProduct ? "Edit Product" : "New Product"}
          </h6>
        </div>

        <TextField
          fullWidth
          label="ID"
          name="id"
          value={product.id}
          onChange={handleChange}
          margin="normal"
          type="number"
          disabled={!!initialProduct}
        />
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={product.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          margin="normal"
        />

        <button
          onClick={handleSave}
          className="bg-primary mt-4 w-full rounded-lg p-4 font-bold uppercase text-white"
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
