"use client";

import React from "react";
import { TextField } from "@mui/material";

import ProductList from "@/components/ProductList";
import { Product } from "@/types/Product";
import TabHeader from "./TabHeader";

type ListType = "shopping" | "offer" | "available";

interface ProductsTabProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddProduct: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product, fromList: ListType) => void;
  onAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => Promise<void> | void;
  onClearList: (list: ListType) => Promise<void> | void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  searchTerm,
  onSearchChange,
  onAddProduct,
  onEdit,
  onDelete,
  onAddToList,
  onClearList,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-24">
      <TabHeader
        title="PRODUCTS"
        iconSrc="/images/mysuper.png"
        iconAlt="Products icon"
        actionSlot={
          <button
            onClick={onAddProduct}
            className="rounded-lg bg-primary px-4 py-2 font-bold uppercase text-white"
          >
            ADD
          </button>
        }
      />

      <div className="rounded-2xl bg-white p-4 shadow">
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={onSearchChange}
        />

        <ProductList
          products={products}
          onEdit={onEdit}
          onDelete={onDelete}
          onClearList={onClearList}
          onAddToList={onAddToList}
          currentList="available"
          totalCost={0}
        />
      </div>
    </div>
  );
};

export default ProductsTab;

